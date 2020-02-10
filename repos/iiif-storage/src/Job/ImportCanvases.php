<?php

namespace IIIFStorage\Job;

use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Utility\OmekaValue;
use IIIFStorage\Repository\ManifestRepository;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use Omeka\Api\Exception\ValidationException;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Job\AbstractJob;
use Omeka\Job\JobInterface;
use Throwable;
use Zend\Log\Logger;

class ImportCanvases extends AbstractJob implements JobInterface
{
    const CANVAS_REFERENCE = 'CANVAS_REFERENCE';

    public function perform()
    {
        /** @var Logger $logger */
        $logger = $this->getServiceLocator()->get('Omeka\Logger');
        /** @var Manager $api */
        $api = $this->getServiceLocator()->get('Omeka\ApiManager');
        /** @var PropertyIdSaturator $saturator */
        $saturator = $this->getServiceLocator()->get(PropertyIdSaturator::class);
        /** @var CheapOmekaRelationshipRequest $relationshipRequest */
        $relationshipRequest = $this->getServiceLocator()->get(CheapOmekaRelationshipRequest::class);
        $canvasList = $this->getArg('canvasList');

        $canvasIds = [];
        foreach ($canvasList as $canvas) {
            try {
                // Add existing manifests to list.
                $type = $canvas['type'] ?? null;
                if ($type === self::CANVAS_REFERENCE) {
                    $id = $canvas['id'];
                    $logger->info("ID already exists: $id adding as reference");
                    $omekaId = isset($canvas['omeka_id'])
                        ? $canvas['omeka_id']
                        : $relationshipRequest->getResourceIdByUri('sc:Canvas', $id);
                    $logger->info("Found Omeka ID: $omekaId");

                    if (!$omekaId) {
                        $logger->warn("Resource with id: $id has been removed since adding to job, skipping...");
                        continue;
                    }
                    if (isset($canvas['manifestId']) && $canvas['manifestId']) {
                        $manifestItemId = $this->getManifestItemId($canvas['manifestId']);
                        if ($manifestItemId) {
                            $canvasIds[$manifestItemId] = isset($canvasIds[$manifestItemId]) ? $canvasIds[$manifestItemId] : [];
                            $canvasIds[$manifestItemId][] = $omekaId;
                        }
                    } else {
                        $logger->warn("WARNING: Orphaned canvas $id, this will not be attached to a manifest. Canvas references need `manifestId` argument in the job in order to attach to manifest.");
                    }
                    continue;
                }

                $id = ($canvas['@id'] ?? $canvas['id']);
                $logger->info("Importing {$id}");

                $item = ItemRequest::fromScratch();
                $saturator->addResourceTemplateByName('IIIF Canvas', $item);
                $item->addFields(
                    FieldValue::literalsFromRdf('dcterms:title', 'Label', $canvas['label'] ?? 'Untitled canvas')
                );
                $item->addField(
                    FieldValue::url('dcterms:identifier', 'Canvas ID', $id)
                );
                $item->addField(
                    FieldValue::literal('dcterms:source', 'Source', json_encode($canvas, JSON_UNESCAPED_SLASHES))
                );
                $item->addFields(
                    FieldValue::literalsFromRdf('sc:attributionLabel', 'Attribution', $manifest['attribution'] ?? null)
                );
                if (isset($canvas['otherContent'])) {
                    $item->addFields(
                        array_map(function ($otherContent) {
                            return FieldValue::url('sc:hasLists', $otherContent['label'], $otherContent['@id']);
                        }, $canvas['otherContent'])
                    );
                }

                $manifestId = null;
                $manifestItemId = null;

                if (isset($canvas['partOf']['id'])) {
                    $manifestId = $canvas['partOf']['id'];
                    $manifestItemId = isset($canvas['partOf']['omeka_id'])
                        ? $canvas['partOf']['omeka_id']
                        : $this->getManifestItemId($manifestId) ;
                    $logger->info("Found manifest in `partOf` field: {$manifestItemId}");

                    if ($manifestItemId) {
                        $item->addField(
                            FieldValue::entity('dcterms:isPartOf', $manifestItemId, 'resource:item')
                        );
                        $logger->info("(isPartOf) Attaching node id: {$id} to {$manifestItemId}");
                    } else {
                        $logger->warn('WARNING: Orphaned canvas, this will not be attached to a manifest. Could not find manifest defined in `partOf` property on canvas');
                    }
                } else {
                    $logger->warn('WARNING: Orphaned canvas, this will not be attached to a manifest. Imported manifests need a `partOf` property to be attached to a manifest.');
                }

                // I think this was missing.
                $saturator->addPropertyIds($item);

                /** @var ItemRepresentation|null $response */
                $response = $this->createItem($api, $logger, $item);
                if ($response) {
                    $logger->info('Finished creating canvas, with id ' . $response->id());
                } else {
                    $logger->warn('Canvas may not have been imported');
                }

                if ($manifestItemId && $response && $response->id()) {
                    $canvasIds[$manifestItemId] = isset($canvasIds[$manifestItemId]) ? $canvasIds[$manifestItemId] : [];
                    $canvasIds[$manifestItemId][] = (string)$response->id();
                }
            } catch (ValidationException $e) {
                $logger->warn($e->getMessage());
                $logger->warn('Validation failed for canvas: ' . (string)$e);
            } catch (Throwable $e) {
                $logger->err($e->getMessage());
                $logger->err('Skipping canvas, unknown error: ' . (string)$e);
            }
        }

        if (empty($canvasIds)) return;

        $logger->info('Found ' . sizeof($canvasIds) . ' canvases to add to manifests', $canvasIds);
        // Finally add canvases to manifests.
        foreach ($canvasIds as $manifestId => $idList) {
            try {
                $this->addCanvasesToManifest($manifestId, $idList);
            } catch (Throwable $e) {
                $logger->err("Could not add canvases to $manifestId");
                $logger->err((string) $e);
            }
        }
    }

    public function createItem(Manager $api, Logger $logger, ItemRequest $item)
    {
        try {
            return $api->create('items', $item->export())->getContent();
        } catch (Throwable $e) {
            $logger->warn((string) $e);
            $logger->warn('Failed to import canvas, trying without media');
            try {
                $export = $item->export();
                unset($export['o:media']);
                return $api->create('items', $export)->getContent();
            } catch (Throwable $e) {
                $logger->err($e->getMessage());
                return null;
            }
        }
    }

    public function addCanvasesToManifest(string $manifestId, $idList)
    {
        $idList = is_array($idList) ? $idList : [$idList];
        /** @var ManifestRepository $manifestRepo */
        $manifestRepo = $this->getServiceLocator()->get(ManifestRepository::class);
        $manifestRepo->mutate($manifestId, function (ItemRequest $item) use ($idList) {
            foreach ($idList as $canvasId) {
                $item->addField(
                    FieldValue::entity('sc:hasCanvases', $canvasId)
                );
            }
        });
    }

    private function getManifestItemId($manifestId)
    {
        /** @var ManifestRepository $manifestRepo */
        $manifestRepo = $this->getServiceLocator()->get(ManifestRepository::class);
        $manifest = $manifestRepo->getByResource($manifestId);
        if (!$manifest) {
            return null;
        }
        return $manifest->id();
    }
}

<?php

namespace IIIFStorage\Job;

use IIIFStorage\Model\FieldValue;
use IIIFStorage\Model\ItemRequest;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\PropertyIdSaturator;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Job\AbstractJob;
use Omeka\Job\JobInterface;
use Throwable;
use Zend\Log\Logger;

class ImportCanvases extends AbstractJob implements JobInterface
{
    public function perform()
    {
        /** @var Logger $logger */
        $logger = $this->getServiceLocator()->get('Omeka\Logger');
        /** @var Manager $api */
        $api = $this->getServiceLocator()->get('Omeka\ApiManager');
        /** @var PropertyIdSaturator $saturator */
        $saturator = $this->getServiceLocator()->get(PropertyIdSaturator::class);
        $canvasList = $this->getArg('canvasList');

        $canvasIds = [];
        foreach ($canvasList as $canvas) {
            $id = ($canvas['@id'] ?? $canvas['id']);
            $logger->info("Importing {$id}");
            $item = ItemRequest::fromScratch();
            $saturator->addResourceTemplateByName('IIIF Canvas', $item);
            // @todo get international string from label (P2 and P3)
            $item->addField(
                FieldValue::literal('dcterms:title', 'Label', $canvas['label'] ?? 'Untitled canvas')
            );
            $item->addField(
                FieldValue::url('dcterms:identifier', 'Canvas ID', $id)
            );
            $item->addField(
                FieldValue::literal('dcterms:source', 'Source', json_encode($canvas, JSON_UNESCAPED_SLASHES))
            );

            $manifestId = null;
            $manifestItemId = null;

            if (isset($canvas['partOf']['id'])) {
                $manifestId = $canvas['partOf']['id'];
                $manifestItemId = $this->getManifestItemId($manifestId);
                if ($manifestItemId) {
                    $item->addField(
                        FieldValue::entity('dcterms:isPartOf', $manifestItemId, 'resource:item')
                    );
                    $logger->info("(isPartOf) Attaching node id: {$id} to {$manifestItemId}");
                }
            } else {
                $logger->warn('WARNING: Orphaned canvas, this will not be attached to a manifest.');
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
        }

        $logger->info('Found some canvases to add to manifests', $canvasIds);
        // Finally add canvases to manifests.
        foreach ($canvasIds as $manifestId => $idList) {
            $this->addCanvasesToManifest($manifestId, $idList);
        }
    }

    public function createItem(Manager $api, Logger $logger, ItemRequest $item)
    {
        try {
            return $api->create('items', $item->export())->getContent();
        } catch (Throwable $e) {
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

    public function addCanvasesToManifest(string $manifestId, array $idList)
    {
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

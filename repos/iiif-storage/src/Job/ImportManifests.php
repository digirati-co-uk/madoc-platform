<?php

namespace IIIFStorage\Job;


use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use Omeka\Api\Exception\ValidationException;
use Omeka\Job\AbstractJob;
use Omeka\Job\JobInterface;
use Zend\Log\Logger;

class ImportManifests extends AbstractJob implements JobInterface
{

    const MANIFEST_REFERENCE = 'MANIFEST_REFERENCE';

    /**
     * Perform this job.
     */
    public function perform()
    {
        /** @var Logger $logger */
        $logger = $this->getServiceLocator()->get('Omeka\Logger');
        /** @var ManifestRepository $repository */
        $repository = $this->getServiceLocator()->get(ManifestRepository::class);
        /** @var CollectionRepository $collectionRepository */
        $collectionRepository = $this->getServiceLocator()->get(CollectionRepository::class);
        /** @var CheapOmekaRelationshipRequest $relationshipRequest */
        $relationshipRequest = $this->getServiceLocator()->get(CheapOmekaRelationshipRequest::class);
        $manifestList = $this->getArg('manifestList');
        $collectionId = $this->getArg('collection');

        if ($collectionId) {
            $logger->info('Importing into collection', ['collection' => $collectionId]);
        }

        $manifestIds = [];

        $totalManifests = sizeof($manifestList);
        $logger->info("Collection contains $totalManifests manifests");


        for ($i = 0; $i < $totalManifests; $i ++) {
            $manifest = $manifestList[$i] ?? null;
            $id = $manifest['@id'] ?? '';
            $logger->info("Importing ${$id}");
            try {
                // Add existing manifests to list.
                $type = $manifest['type'] ?? null;
                if ($type === self::MANIFEST_REFERENCE) {
                    $id = $manifest['id'];
                    $logger->info("ID already exists: $id adding as reference");
                    $omekaId = $relationshipRequest->getResourceIdByUri('sc:Manifest', $id);
                    $logger->info("Found Omeka ID: $omekaId");
                    if (!$omekaId) {
                        $logger->warn("Resource with id: $id has been removed since adding to job, skipping...");
                        continue;
                    }
                    $manifestIds[] = $omekaId;
                    continue;
                }

                $id = $manifest['@id'];
                $logger->info("Importing manifest $id");
                // Create item using repository.
                $manifestItem = $repository->create(function (ItemRequest $item) use ($manifest, $id, $logger) {
                    $item->addField(
                        FieldValue::literal('dcterms:title', 'Label', $manifest['label'] ?? 'Untitled manifest')
                    );
                    $item->addField(
                        FieldValue::url('dcterms:identifier', 'Manifest URI', $id)
                    );
                });
                // Create list of ids.
                $manifestIds[] = $manifestItem->id();
            } catch (ValidationException $e) {
                $logger->warn($e->getMessage());
                $logger->warn('Validation failed for manifest: ' . (string)$e);
                continue;
            } catch (\Throwable $e) {
                $logger->err($e->getMessage());
                $logger->err('Skipping manifest, unknown error: ' . (string)$e);
                continue;
            }
        }

        if (!$collectionId) {
            $logger->info('Skipping adding to collection');
            return;
        }

        $collection = $collectionRepository->getByResource($collectionId);
        if (!$collection) {
            $logger->err('No collection found to attach items to');
            return;
        }

        // Add manifest fields.
        $collectionRepository->mutate($collection->id(), function (ItemRequest $item) use ($manifestIds) {
            foreach ($manifestIds as $manifestId) {
                $item->addField(
                    FieldValue::entity('sc:hasManifests', $manifestId)
                );
            }
        });

        $logger->info('Added ' . count($manifestIds) . ' to Collection ' . $collection->id());
    }
}

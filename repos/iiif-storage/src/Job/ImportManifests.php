<?php
/**
 * Created by PhpStorm.
 * User: stephen
 * Date: 2018-09-24
 * Time: 16:52
 */

namespace IIIFStorage\Job;


use IIIFStorage\Model\FieldValue;
use IIIFStorage\Model\ItemRequest;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\PropertyIdSaturator;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Job\AbstractJob;
use Omeka\Job\JobInterface;
use Zend\Log\Logger;

class ImportManifests extends AbstractJob implements JobInterface
{

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
        $manifestList = $this->getArg('manifestList');
        $collectionId = $this->getArg('collection');

        $logger->info('Importing manifests', $manifestList);
        if ($collectionId) {
            $logger->info('Importing into collection', ['collection' => $collectionId]);
        }

        $manifestIds = [];

        foreach ($manifestList as $manifest) {
            $id = $manifest['@id'];
            // Create item using repository.
            $manifestItem = $repository->create(function (ItemRequest $item) use ($manifest, $id) {
                $item->addField(
                    FieldValue::literal('dcterms:title', 'Label', $manifest['label'] ?? 'Untitled manifest')
                );
                $item->addField(
                    FieldValue::url('dcterms:identifier', 'Manifest URI', $id)
                );
            });
            // Create list of ids.
            $manifestIds[] = $manifestItem->id();
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

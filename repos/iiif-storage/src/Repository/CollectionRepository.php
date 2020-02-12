<?php

namespace IIIFStorage\Repository;

use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use IIIFStorage\Model\PaginatedResult;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use Omeka\Api\Exception\NotFoundException;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemSetRepresentation;
use Zend\Log\Logger;

class CollectionRepository
{
    const RESOURCE_TEMPLATE = 'IIIF Collection';
    const API_TYPE = 'item_sets';

    /**
     * @var Manager
     */
    private $api;

    /**
     * @var PropertyIdSaturator
     */
    private $saturator;

    /**
     * @var string
     */
    private $siteId;
    /**
     * @var CheapOmekaRelationshipRequest
     */
    private $relationshipRequest;

    public function __construct(
        Manager $api,
        PropertyIdSaturator $saturator,
        CheapOmekaRelationshipRequest $relationshipRequest
    ) {

        $this->api = $api;
        $this->saturator = $saturator;
        $this->relationshipRequest = $relationshipRequest;
    }

    public function getPropertyId(): string
    {
        return (string)$this->saturator->getResourceTemplateByName(static::RESOURCE_TEMPLATE)->id();
    }

    public function setSiteId($siteId)
    {
        $this->siteId = $siteId;
    }

    public function getDefaultQuery()
    {
        $query = [
            'resource_template_id' => $this->getPropertyId(),
        ];
        if ($this->siteId) {
            $query['site_id'] = $this->siteId;
        }
        return $query;
    }

    public function getSource(int $id): array
    {
        return $this->relationshipRequest->selectSource($id);
    }

    public function getManifestMapFromCollection(int $collectionOmekaId, $limit = -1, int $offset = 0): PaginatedResult
    {
        try {
            return $this->relationshipRequest->getUriMapping(
                $collectionOmekaId,
                'sc:hasManifests',
                $limit,
                $offset
            );
        } catch (\Throwable $e) {
            error_log((string) $e);
            return new PaginatedResult([], $offset, $limit);
        }
    }

    public function getById(string $id): ItemSetRepresentation
    {
        $collection = $this->api->read(static::API_TYPE, $id, $this->getDefaultQuery())->getContent();
        if (!$collection) {
            throw new NotFoundException();
        }
        return $collection;
    }

    public function getAll(): array
    {
        return $this->api->search(static::API_TYPE, $this->getDefaultQuery())->getContent();
    }

    public function mutate(string $id, callable $mutation, Logger $logger = null)
    {
        // Get fresh
        $item = $this->getById($id);
        // Turn into request.
        $itemRequest = ItemRequest::fromSource(json_decode(json_encode($item), true));
        // Mutate from params.
        $mutation($itemRequest, $item, $id);
        // Saturate.
        $this->saturator->addPropertyIds($itemRequest);
        // Re-export.
        $toUpdate = $itemRequest->export();
        // Update.
        return $this->api->update(static::API_TYPE, $id, $toUpdate, [], ['isPartial' => true])->getContent();
    }

    public function containsManifest(int $collection, string $manifestId): bool
    {
        try {
            $manifestMapping = $this->relationshipRequest->getUriMapping(
                $collection,
                'sc:hasManifests'
            );
        } catch (\Throwable $e) {
            error_log((string) $e);
            return false;
        }

        foreach ($manifestMapping->getList() as $omekaId => $urlId) {
            if (
                (string)$omekaId === (string)$manifestId ||
                (string)$urlId === (string)$manifestId
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param string $id
     * @return null|ItemSetRepresentation
     */
    public function getByResource(string $id)
    {
        $items = $this->api->search(static::API_TYPE, [
            'resource_class_id' => $this->saturator->getResourceClassByTerm('sc:Collection')->id(),
            'property' => [
                [
                    'joiner' => 'and',
                    'property' => $this->saturator->loadPropertyId('dcterms:identifier'),
                    'type' => 'eq',
                    'text' => $id,
                ]
            ]
        ])->getContent();

        if (empty($items)) {
            return null;
        }

        /** @var ItemSetRepresentation $collection */
        $item = array_pop($items);

        return $item;
    }

    public function search(string $search): array
    {
        $query = $this->getDefaultQuery();
        $query['search'] = $search;
        return $this->api->search(static::API_TYPE, $query)->getContent();
    }

    public function delete(int $id)
    {
        $this->api->delete(static::API_TYPE, $id);
    }

    public function create(callable $mutation): ItemSetRepresentation
    {
        // Item request from scratch.
        $item = ItemRequest::fromScratch();
        // Add resource template.
        $this->saturator->addResourceTemplateByName('IIIF Collection', $item);
        // Mutate from params.
        $mutation($item);
        // Saturate.
        $this->saturator->addPropertyIds($item);
        // Create.
        return $this->api->create(static::API_TYPE, $item->export())->getContent();
    }
}

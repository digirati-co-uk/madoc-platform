<?php

namespace IIIFStorage\Repository;

use IIIFStorage\Model\ItemRequest;
use IIIFStorage\Utility\PropertyIdSaturator;
use Omeka\Api\Exception\NotFoundException;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\ValueRepresentation;
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

    public function __construct(Manager $api, PropertyIdSaturator $saturator)
    {

        $this->api = $api;
        $this->saturator = $saturator;
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

    public function containsManifest(ItemSetRepresentation $collection, string $manifestId): bool
    {
        $manifests = $collection->value('sc:hasManifests', ['all' => true]);
        foreach ($manifests as $manifestValue) {
            /** @var ValueRepresentation $manifestValue */
            $manifest = $manifestValue->valueResource();
            if ($manifest && (string)$manifest->id() === (string)$manifestId) {
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

    /**
     * @param ItemSetRepresentation $collection
     * @return ItemRepresentation[]
     */
    public function getManifests(ItemSetRepresentation $collection)
    {
        $manifests = $collection->value('sc:hasManifests', ['all' => true]);
        return array_map(function (ValueRepresentation $manifestValue) {
            return $manifestValue->valueResource();
        }, $manifests);
    }
}

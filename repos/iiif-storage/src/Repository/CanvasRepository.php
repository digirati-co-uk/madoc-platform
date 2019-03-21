<?php

namespace IIIFStorage\Repository;

use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use IIIFStorage\Model\PaginatedResult;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;

class CanvasRepository
{
    const RESOURCE_TEMPLATE = 'IIIF Canvas';
    const API_TYPE = 'items';

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

    public function __construct(Manager $api, PropertyIdSaturator $saturator, CheapOmekaRelationshipRequest $relationshipRequest)
    {

        $this->api = $api;
        $this->saturator = $saturator;
        $this->relationshipRequest = $relationshipRequest;
    }

    public function getPropertyId(): string
    {
        return (string)$this->saturator->getResourceTemplateByName(static::RESOURCE_TEMPLATE)->id();
    }

    public function setSiteId(string $siteId)
    {
        $this->siteId = $siteId;
    }

    /**
     * @param string|ItemRepresentation $id
     * @param callable $mutation
     * @return ItemRepresentation
     */
    public function mutate($id, callable $mutation)
    {
        // Get fresh
        $item = $id instanceof ItemRepresentation ? $id : $this->getById($id);
        // Get id
        $id = $item->id();
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

    public function getById(string $id): ItemRepresentation
    {
        return $this->api->read(static::API_TYPE, $id, $this->getDefaultQuery())->getContent();
    }

    /**
     * @param string $id
     * @return null|ItemRepresentation
     */
    public function getByResource(string $id)
    {
        $items = $this->api->search(static::API_TYPE, [
            'resource_class_id' => $this->saturator->getResourceClassByTerm('sc:Canvas')->id(),
            'property' => [
                [
                    'joiner' => 'and',
                    'property' => $this->saturator->loadPropertyId('dcterms:identifier'),
                    'type' => 'eq',
                    'text' => $id
                ]
            ]
        ])->getContent();

        if (empty($items)) {
            return null;
        }

        // @todo there can be more than one.
        $canvasId = array_pop($items);

        return $canvasId;
    }

    public function getAll(): array
    {
        return $this->api->search(static::API_TYPE, $this->getDefaultQuery())->getContent();
    }

    public function search(string $search): array
    {
        $query = $this->getDefaultQuery();
        $query['search'] = $search;
        return $this->api->search(static::API_TYPE, $query)->getContent();
    }

    public function getSource(int $id): array
    {
        return $this->relationshipRequest->selectSource($id);
    }

    /**
     * @param ItemRepresentation $canvas
     * @return PaginatedResult
     * @throws \Doctrine\DBAL\DBALException
     */
    public function getManifests(ItemRepresentation $canvas): PaginatedResult
    {
        return $this->relationshipRequest->getUriMapping(
            $canvas->id(),
            'dcterms:isPartOf'
        );
    }
}

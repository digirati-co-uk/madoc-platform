<?php

namespace IIIFStorage\Repository;

use IIIFStorage\Model\ItemRequest;
use IIIFStorage\Utility\PropertyIdSaturator;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

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

    public function __construct(Manager $api, PropertyIdSaturator $saturator)
    {

        $this->api = $api;
        $this->saturator = $saturator;
    }

    public function getPropertyId(): string
    {
        return (string)$this->saturator->getResourceTemplateByName(static::RESOURCE_TEMPLATE)->id();
    }

    public function setSiteId(string $siteId)
    {
        $this->siteId = $siteId;
    }

    public function mutate(string $id, callable $mutation)
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


    /**
     * @param ItemRepresentation $canvas
     * @return ItemRepresentation[]
     */
    public function getManifests(ItemRepresentation $canvas)
    {
        $manifests = $canvas->value('dcterms:isPartOf', ['all' => true]) ?? [];
        return array_map(function (ValueRepresentation $value) {
            return $value->valueResource();
        }, $manifests);
    }
}

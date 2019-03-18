<?php

namespace IIIFStorage\Repository;

use Error;
use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ValueRepresentation;
use Throwable;

class ManifestRepository
{
    const RESOURCE_TEMPLATE = 'IIIF Manifest';
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

    public function create(callable $mutation): ItemRepresentation
    {
        // Item request from scratch.
        $item = ItemRequest::fromScratch();
        // Add resource template.
        $this->saturator->addResourceTemplateByName('IIIF Manifest', $item);
        // Mutate from params.
        $mutation($item);
        // Saturate.
        $this->saturator->addPropertyIds($item);
        // Create.
        return $this->api->create(static::API_TYPE, $item->export())->getContent();
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

        $updateFunction = function() use ($id, $toUpdate) {
            $this->api->update(static::API_TYPE, $id, $toUpdate, [], ['isPartial' => true])->getContent();
        };

        $tries = 5;
        while ($tries) {
            try {
                return $updateFunction();
            } catch (Throwable $e) {
                error_log((string) $e);
            }
            $tries -= 1;
            sleep(2);
        }
        throw new Error('Could not save manifest');
    }

    public function getById(string $id): ItemRepresentation
    {
        return $this->api->read(static::API_TYPE, $id, $this->getDefaultQuery())->getContent();
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
     * @param string $id
     * @return null|ItemRepresentation
     */
    public function getByResource(string $id)
    {
        $items = $this->api->search(static::API_TYPE, [
            'resource_class_id' => $this->saturator->getResourceClassByTerm('sc:Manifest')->id(),
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
        $manifestItem = array_pop($items);

        return $manifestItem;
    }

    /**
     * @param ItemRepresentation $manifest
     * @return ItemRepresentation[]
     */
    public function getCanvases(ItemRepresentation $manifest): array
    {
        $canvases = $manifest->value('sc:hasCanvases', ['all' => true]) ?? [];
        return array_map(function (ValueRepresentation $canvasValue) {
            return $canvasValue->valueResource();
        }, $canvases);
    }

    public function containsCanvas(ItemRepresentation $manifest, string $canvasId): bool
    {
        $canvases = $this->getCanvases($manifest);
        foreach ($canvases as $canvas) {
            if ($canvas && (string)$canvas->id() === (string)$canvasId) {
                return true;
            }
        }
        return false;
    }
}

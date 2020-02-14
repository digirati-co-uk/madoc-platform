<?php

namespace IIIFStorage\Repository;

use Digirati\OmekaShared\Model\FieldValue;
use Error;
use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use IIIFStorage\Model\PaginatedResult;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
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

    /**
     * @var CanvasRepository
     */
    private $canvasRepository;
    /**
     * @var CheapOmekaRelationshipRequest
     */
    private $relationshipRequest;

    /**
     * @var mixed
     */
    private $lastError;

    public function __construct(
        Manager $api,
        CanvasRepository $canvasRepository,
        PropertyIdSaturator $saturator,
        CheapOmekaRelationshipRequest $relationshipRequest
    ) {
        $this->api = $api;
        $this->canvasRepository = $canvasRepository;
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

    public function getLastError()
    {
        return $this->lastError;
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

        $updateFunction = function () use ($id, $toUpdate) {
            $this->api->update(static::API_TYPE, $id, $toUpdate, [], ['isPartial' => true])->getContent();
        };

        $tries = 5;
        while ($tries) {
            try {
                return $updateFunction();
            } catch (Throwable $e) {
                error_log((string)$e);
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

    public function getNonReplacements(): array
    {
        $items = $this->api->search(static::API_TYPE, [
            'resource_class_id' => $this->saturator->getResourceClassByTerm('sc:Manifest')->id(),
            'property' => [
                [
                    'joiner' => 'and',
                    'property' => $this->saturator->loadPropertyId('dcterms:replaces'),
                    'type' => 'nex',
                ]
            ]
        ])->getContent();

        return $items;
    }

    public function getReplacements(string $id): array
    {
        $items = $this->api->search(static::API_TYPE, [
            'resource_class_id' => $this->saturator->getResourceClassByTerm('sc:Manifest')->id(),
            'property' => [
                [
                    'joiner' => 'and',
                    'property' => $this->saturator->loadPropertyId('dcterms:replaces'),
                    'type' => 'res',
                    'text' => $id
                ]
            ]
        ])->getContent();

        return $items;
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

    public function getSource(int $id): array
    {
        return $this->relationshipRequest->selectSource($id) ?? [];
    }

    /**
     * @param ItemRepresentation $manifest
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function getCanvases(ItemRepresentation $manifest, $page = 1, $perPage = -1): array
    {
        if ($page < 1) {
            $page = 1;
        }

        $canvasMapping = $perPage === -1
            ? $this->getCanvasMapFromManifest($manifest->id())
            : $this->getCanvasMapFromManifest($manifest->id(), $perPage, ($page - 1) * $perPage);

        $canvases = [];
        foreach ($canvasMapping->getList() as $canvasId) {
            $canvases[] = $this->canvasRepository->getById($canvasId);
        }

        return [
            'canvases' => $canvases,
            'totalResults' => $canvasMapping->getTotalResults(),
        ];
    }

    public function getPreviousNext(int $manifestId, int $canvasId, int $number = 1)
    {
        $canvases = array_values($this->getCanvasMapFromManifest($manifestId)->getList());
        $max = sizeof($canvases);
        foreach ($canvases as $key => $canvas) {
            if ((int)$canvas === (int)$canvasId) {
                $hasPrevious = ($key - $number >= 0);
                $previousStart = $key - $number;
                $previousLength = $number;
                $hasNext = ($key !== $max);
                $nextStart = $key + 1;
                $nextLength = $number;

                return [
                    'previous' => $hasPrevious ? array_slice($canvases, $previousStart, $previousLength) : [],
                    'next' => $hasNext ? array_slice($canvases, $nextStart, $nextLength) : [],
                ];
            }
        }
        return [];
    }

    public function getCanvasMapFromManifest(int $manifestId, $limit = -1, int $offset = 0): PaginatedResult
    {
        try {
            return $this->relationshipRequest->getUriMapping(
                $manifestId,
                'sc:hasCanvases',
                $limit,
                $offset
            );
        } catch (\Throwable $e) {
            error_log((string)$e);
            return new PaginatedResult([], $limit, $offset);
        }
    }

    public function getEtag(int $resourceId)
    {
        return $this->relationshipRequest->getEtag($resourceId);
    }

    public function containsCanvas(int $manifest, string $canvasId, string $alt = null): bool
    {
        try {
            $canvasMapping = $this->relationshipRequest->getUriMapping(
                $manifest,
                'sc:hasCanvases'
            );
        } catch (\Throwable $e) {
            error_log((string)$e);
            return false;
        }

        foreach ($canvasMapping->getList() as $omekaId => $urlId) {
            if (
            (string)$omekaId === (string)$canvasId ||
            (string)$urlId === (string)$canvasId ||
            (string)$omekaId === (string)$alt ||
            (string)$urlId === (string)$alt
            ) {
                return true;
            }
        }
        return false;
    }

    public function getTotalCanvases(int $manifestId)
    {
        $canvases = $this->getCanvasMapFromManifest($manifestId);

        return $canvases->getTotalResults();
    }

    public function delete(int $id)
    {
        $this->api->delete(static::API_TYPE, $id);
    }

    /**
     * @param int $manifestId
     * @return PaginatedResult
     * @throws \Doctrine\DBAL\DBALException
     */
    public function getCollections(int $manifestId): PaginatedResult
    {
        return $this->relationshipRequest->getUriMapping(
            $manifestId,
            'dcterms:isPartOf'
        );
    }
}

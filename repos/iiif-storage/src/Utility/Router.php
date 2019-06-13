<?php

namespace IIIFStorage\Utility;


use Digirati\OmekaShared\Helper\UrlHelper;
use IIIF\Model\Canvas;
use IIIF\Model\Collection;
use IIIF\Model\Manifest;
use IIIFStorage\Model\CollectionRepresentation;
use IIIFStorage\Model\ManifestRepresentation;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

class Router
{

    /**
     * @var UrlHelper
     */
    private $url;
    /**
     * @var ManifestRepository
     */
    private $manifest;
    /**
     * @var CollectionRepository
     */
    private $collection;
    /**
     * @var CanvasRepository
     */
    private $canvas;

    public function __construct(UrlHelper $helper, ManifestRepository $manifest, CollectionRepository $collection, CanvasRepository $canvas)
    {

        $this->url = $helper;
        $this->manifest = $manifest;
        $this->collection = $collection;
        $this->canvas = $canvas;
    }

    public function isAdmin()
    {
        $path = $this->url->create(null, [], [], true);
        return strpos($path, 'admin') === 1;
    }


    public function siteCollection()
    {
        return $this->url->create($this->getRoute('collection/all'), [], ['force_canonical' => true], true);
    }

    public function collections()
    {
        return $this->siteCollection();
    }

    public function collection($collection)
    {
        if ($this->isAdmin()) {
            return '#';
        }
        return $this->url->create($this->getRoute('collection/view'), [
            'collection' => $this->extractId($collection)
        ], ['force_canonical' => true], true);
    }

    public function manifest($manifest, $collection = null)
    {
        if ($this->isAdmin()) {
            return '#';
        }
        if ($collection) {
            return $this->url->create(
                $this->getRoute('collection/view-manifest'),
                [
                    'manifest' => $this->extractId($manifest),
                    'collection' => $this->extractId($collection)
                ],
                ['force_canonical' => true],
                true
            );
        }

        return $this->url->create($this->getRoute('manifest/view'), [
            'manifest' => $this->extractId($manifest)
        ], ['force_canonical' => true], true);
    }

    public function canvas($canvas, $manifest = null, $collection = null)
    {
        if ($this->isAdmin()) {
            return '#';
        }
        if (!$manifest) {
            try {
                $manifest = $this->extractManifest($canvas);
            } catch (\Throwable $e) {

            }
        }

        if ($collection && $manifest) {
            return $this->url->create(
                $this->getRoute('collection/view-canvas'),
                [
                    'canvas' => $this->extractId($canvas),
                    'manifest' => $this->extractId($manifest),
                    'collection' => $this->extractId($collection)
                ],
                ['force_canonical' => true],
                true
            );
        }

        if ($manifest) {
            return $this->url->create(
                $this->getRoute('manifest/view-canvas'),
                [
                    'canvas' => $this->extractId($canvas),
                    'manifest' => $this->extractId($manifest),
                ],
                ['force_canonical' => true],
                true
            );
        }

        return $this->url->create($this->getRoute('canvas/view'), [
            'canvas' => $this->extractId($canvas)
        ], ['force_canonical' => true], true);
    }

    public function extractId($entityOrId): string
    {
        if (
            $entityOrId instanceof CollectionRepresentation ||
            $entityOrId instanceof ManifestRepresentation
        ) {
            return $entityOrId->getOmekaId();
        }
        if (
            $entityOrId instanceof Collection ||
            $entityOrId instanceof Manifest ||
            $entityOrId instanceof Canvas
        ) {
            $source = $entityOrId->getSource();
            if (isset($source['o:id'])) {
                return $source['o:id'];
            }

            $id = isset($entityOrId->omekaId) ? $entityOrId->omekaId : null;
            if ($id === null) {
                // THIS IS NOT A GOOD PATH.
                return $this->expensiveFetchId($entityOrId);
            }
            return $id;
        }
        if ($entityOrId instanceof ItemRepresentation) {
            return (string)$entityOrId->id();
        }
        if ($entityOrId instanceof ItemSetRepresentation) {
            return (string)$entityOrId->id();
        }

        if (is_string($entityOrId)) {
            return $this->expensiveFetchId($entityOrId);
        }

        return (string)$entityOrId;
    }

    public function getRoute(string $name)
    {
        return "site/iiif-$name";
    }

    private function extractManifest($canvas)
    {
        if ($canvas instanceof Canvas) {
            $source = $canvas->getSource();
            if (isset($source['partOf'])) {
                return $source['partOf']['@id'] ?? $source['partOf'][0]['@id'] ?? null;
            }
        }

        if (!$canvas instanceof ItemRepresentation) {
            return null;
        }

        $manifests = $canvas->value('dcterms:isPartOf', ['all' => true]) ?? [];
        return current(
                array_map(function (ValueRepresentation $value) {
                    return $value->valueResource();
                }, $manifests)
            ) ?? null;
    }

    private function expensiveFetchId($entityOrId)
    {

        if ($entityOrId instanceof Collection) {
            $resource = $this->manifest->getByResource($entityOrId->getId());
            if ($resource) {
                return $resource->id();
            }
        }
        if ($entityOrId instanceof Manifest) {
            $resource = $this->manifest->getByResource($entityOrId->getId());

            if ($resource) {
                return $resource->id();
            }
        }
        if ($entityOrId instanceof Canvas) {
            $resource = $this->canvas->getByResource($entityOrId->getId());
            if ($resource) {
                return $resource->id();
            }
        }

        // It might be possible to extract ID.
        // NOTE: This is last resort to show something to user.
        $id = is_string($entityOrId) ? $entityOrId : $entityOrId->getId();

        // A better default path, where an ID was already passed in.
        if (is_numeric($id)) {
            return $id;
        }

        if (strpos($id, 'iiif/api') !== false) {
            $id = array_pop(explode('/', array_shift(explode('?', $id))));
            if ($id) {
                return $id;
            }
        }

        // One more case, we might have a string that is the full URL of the manifest.
        $resource = $this->canvas->getByResource($id);
        if ($resource) {
            return $resource;
        }

        throw new \LogicException('Entity ID not found');
    }
}

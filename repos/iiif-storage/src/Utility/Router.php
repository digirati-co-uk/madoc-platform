<?php

namespace IIIFStorage\Utility;


use Digirati\OmekaShared\Helper\UrlHelper;
use IIIF\Model\Canvas;
use IIIF\Model\Collection;
use IIIF\Model\Manifest;
use IIIFStorage\Model\CollectionRepresentation;
use IIIFStorage\Model\ManifestRepresentation;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

class Router
{

    /**
     * @var UrlHelper
     */
    private $url;

    public function __construct(UrlHelper $helper)
    {

        $this->url = $helper;
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
        if ($this->isAdmin()) {
            return '';
        }
        return $this->url->create($this->getRoute('collection/list'), [], ['force_canonical' => true], true);
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
            $manifest = $this->extractManifest($canvas);
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
                throw new \LogicException('Omeka ID not found on resource.');
            }
            return $id;
        }
        if ($entityOrId instanceof ItemRepresentation) {
            return (string)$entityOrId->id();
        }
        if ($entityOrId instanceof ItemSetRepresentation) {
            return (string)$entityOrId->id();
        }
        return (string)$entityOrId;
    }

    public function getRoute(string $name)
    {
        return "site/iiif-$name";
    }

    private function extractManifest($canvas)
    {
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
}

<?php

namespace IIIFStorage\Model;

use IIIF\Model\Canvas;
use IIIF\Model\Manifest;
use Omeka\Api\Representation\ItemRepresentation;

class ManifestRepresentation implements ResourceRepresentation
{
    /**
     * @var ItemRepresentation
     */
    private $item;

    /**
     * @var Manifest
     */
    private $manifest;

    /**
     * @var array
     */
    private $json;

    public function __construct(ItemRepresentation $item, Manifest $manifest, array $json)
    {
        $this->item = $item;
        $this->manifest = $manifest;
        $this->json = $json;
    }

    public function getId(): string
    {
        return $this->json['@id'];
    }

    public function getOmekaId(): string
    {
        return $this->item->id();
    }

    /**
     * @return array
     */
    public function getJson(): array
    {
        return $this->json;
    }

    /**
     * @return Manifest
     */
    public function getManifest(): Manifest
    {
        return $this->manifest;
    }

    /**
     * @return ItemRepresentation
     */
    public function getItem(): ItemRepresentation
    {
        return $this->item;
    }

    public function getPreviousCanvas(Canvas $canvas)
    {
        $canvases = $this->manifest->getCanvases();
        foreach ($canvases as $index => $manifestCanvas) {
            if ($manifestCanvas->getId() === $canvas->getId()) {
                if (isset($canvases[$index - 1])) {
                    return $canvases[$index - 1];
                }
                break;
            }
        }
        return null;
    }

    public function getNextCanvas(Canvas $canvas)
    {
        $canvases = $this->manifest->getCanvases();
        foreach ($canvases as $index => $manifestCanvas) {
            if ($manifestCanvas->getId() === $canvas->getId()) {
                if (isset($canvases[$index + 1])) {
                    return $canvases[$index + 1];
                }
                break;
            }
        }
        return null;
    }

}

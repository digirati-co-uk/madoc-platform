<?php

namespace IIIFStorage\Model;

use IIIF\Model\Canvas;
use Omeka\Api\Representation\ItemRepresentation;

class CanvasRepresentation implements ResourceRepresentation
{
    /**
     * @var ItemRepresentation
     */
    private $item;
    /**
     * @var Canvas
     */
    private $canvas;
    /**
     * @var array
     */
    private $json;

    public function __construct(ItemRepresentation $item, Canvas $canvas, array $json)
    {
        $this->item = $item;
        $this->canvas = $canvas;
        $this->json = $json;
    }

    public function getId(): string
    {
        return $this->canvas->getId();
    }

    public function getOmekaId(): string
    {
        return $this->item->id();
    }

    public function getJson(): array
    {
        return $this->json;
    }

    public function getCanvas()
    {
        return $this->canvas;
    }
}

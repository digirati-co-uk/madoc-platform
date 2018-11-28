<?php

namespace IIIFStorage\Model;

use IIIF\Model\Collection;
use Omeka\Api\Representation\ItemSetRepresentation;

class CollectionRepresentation implements ResourceRepresentation
{
    /**
     * @var ItemSetRepresentation
     */
    private $itemSet;

    /**
     * @var Collection
     */
    private $collection;

    /**
     * @var array
     */
    private $json;

    public function __construct(ItemSetRepresentation $itemSet, Collection $collection, array $json)
    {
        $this->itemSet = $itemSet;
        $this->collection = $collection;
        $this->json = $json;
    }

    /**
     * @return string
     */
    public function getId(): string
    {
        return $this->json['@id'];
    }

    /**
     * @return string
     */
    public function getOmekaId(): string
    {
        return $this->itemSet->id();
    }

    /**
     * @return array
     */
    public function getJson(): array
    {
        return $this->json;
    }

    /**
     * @return Collection
     */
    public function getCollection(): Collection
    {
        return $this->collection;
    }

    /**
     * @return ItemSetRepresentation
     */
    public function getItemSet(): ItemSetRepresentation
    {
        return $this->itemSet;
    }
}

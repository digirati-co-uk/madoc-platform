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
     * @var BuiltCollection
     */
    private $builtCollection;

    public function __construct(
        ItemSetRepresentation $itemSet,
        Collection $collection,
        BuiltCollection $json
    )
    {
        $this->itemSet = $itemSet;
        $this->collection = $collection;
        $this->builtCollection = $json;
    }

    /**
     * @return string
     */
    public function getId(): string
    {
        return $this->builtCollection->getJson()['@id'];
    }

    /**
     * @return string
     */
    public function getOmekaId(): string
    {
        return $this->itemSet->id();
    }

    /**
     * @return int
     */
    public function getPage(): int
    {
        return $this->builtCollection->getPage();
    }

    /**
     * @return int
     */
    public function getPerPage(): int
    {
        return $this->builtCollection->getPerPage();
    }

    /**
     * @return int
     */
    public function getTotalResults(): int
    {
        return $this->builtCollection->getTotalResults();
    }

    /**
     * @return array
     */
    public function getJson(): array
    {
        return $this->builtCollection->getJson();
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

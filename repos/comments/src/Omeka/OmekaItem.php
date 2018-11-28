<?php

namespace Comments\Plugin;

use Omeka\Api\Representation\ItemRepresentation;

class OmekaItem implements Subject
{
    private $item;

    public function __construct(ItemRepresentation $item)
    {
        $this->item = $item;
    }

    public function getId(): string
    {
        return (string) $this->item->id();
    }

    public function getLink(): string
    {
        return $this->item->url();
    }

    public function getLabel(): string
    {
        return (string) $this->item->value('dcterms:title');
    }

    public function hasLink(): bool
    {
        return true;
    }
}

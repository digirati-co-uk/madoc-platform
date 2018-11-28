<?php

namespace Comments\Plugin;

class StaticSubject implements Subject
{
    private $id;
    private $label;
    private $link;

    public function __construct(string $id, string $label, string $link = null)
    {
        $this->id = $id;
        $this->label = $label;
        $this->link = $link;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getLink(): string
    {
        return $this->link;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function hasLink(): bool
    {
        return null !== $this->link;
    }
}

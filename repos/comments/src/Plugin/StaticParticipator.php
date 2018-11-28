<?php

namespace Comments\Plugin;

class StaticParticipator implements Participator
{
    private $displayName;
    private $link;
    private $id;

    public function __construct(string $id, string $displayName, string $link = null)
    {
        $this->displayName = $displayName;
        $this->link = $link;
        $this->id = $id;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getDisplayName(): string
    {
        return $this->displayName;
    }

    public function getLink(): string
    {
        return $this->link;
    }

    public function hasLink(): bool
    {
        return null !== $this->link;
    }
}

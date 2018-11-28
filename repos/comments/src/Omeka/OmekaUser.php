<?php

namespace Comments\Plugin;

use Omeka\Entity\User;

class OmekaUser implements Participator
{
    private $displayName;
    private $link;
    private $id;

    public function __construct(string $id, string $displayName, string $link)
    {
        $this->displayName = $displayName;
        $this->link = $link;
        $this->id = $id;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public static function fromEntity(User $user, string $url = null)
    {
        return new static(
            $user->getId(),
            $user->getName(),
            $url
        );
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
        return (bool) $this->link;
    }
}

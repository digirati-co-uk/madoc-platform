<?php

namespace Comments\Elucidate;

use Comments\Plugin\Subject;
use IIIF\Model\Manifest;

class ManifestSubject implements Subject
{
    private $manifest;
    private $url;

    public function __construct(Manifest $manifest, string $url = null)
    {
        $this->manifest = $manifest;
        $this->url = $url;
    }

    public function getId(): string
    {
        return $this->manifest->getId();
    }

    public function getLabel(): string
    {
        return $this->manifest->getLabel();
    }

    public function getLink(): string
    {
        if ($this->url) {
            return $this->url;
        }

        return $this->manifest->getId();
    }

    public function hasLink(): bool
    {
        return true;
    }
}

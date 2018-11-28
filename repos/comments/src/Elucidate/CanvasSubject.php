<?php

namespace Comments\Elucidate;

use Comments\Plugin\Subject;
use IIIF\Model\Canvas;

class CanvasSubject implements Subject
{
    private $canvas;
    private $link;

    public function __construct(Canvas $canvas, string $link = null)
    {
        $this->canvas = $canvas;
        $this->link = $link;
    }

    public function getId(): string
    {
        return $this->canvas->getId();
    }

    public function getLink(): string
    {
        return $this->link ? $this->link : $this->canvas->getId();
    }

    public function getLabel(): string
    {
        return $this->canvas->getLabel() ?? '';
    }

    public function hasLink(): bool
    {
        return null !== $this->link || null !== $this->canvas->getId();
    }
}

<?php

namespace ElucidateModule\ViewModel;

use ArrayAccess as ArrayAccessInterface;
use Elucidate\Model\ArrayAccess;

final class Annotation implements ArrayAccessInterface
{
    use ArrayAccess;

    private $id;
    private $label;
    private $canvasSource;
    private $manifestSource;
    private $source;
    private $thumbnail;
    private $thumbnails;
    private $manifestExists;
    private $motivation;
    private $rawAnnotation;

    public function __construct(
        string $id,
        string $label = null,
        OmekaLink $canvasSource = null,
        OmekaLink $manifestSource = null,
        OmekaSource $source,
        Thumbnail $thumbnail = null,
        string $motivation = null,
        bool $manifestExists = false,
        $rawAnnotation
    ) {
        $this->id = $id;
        $this->label = null === $label ? '' : $label;
        $this->canvasSource = $canvasSource;
        $this->manifestSource = $manifestSource;
        $this->source = $source;
        $this->thumbnail = $thumbnail;
        $this->manifestExists = $manifestExists;
        $this->motivation = $motivation;
        $this->rawAnnotation = $rawAnnotation;
    }

    public function getAnnotation()
    {
        return $this->rawAnnotation;
    }

    public function withThumbnails($thumbnails)
    {
        $new = clone $this;
        $new->thumbnail = $thumbnails[0] ?? null;
        $new->thumbnails = $thumbnails;

        return $new;
    }

    public function withNewSourceId($id)
    {
        $new = clone $this;
        $new->source = new OmekaSource($id, $this->source['type']);

        return $new;
    }
}

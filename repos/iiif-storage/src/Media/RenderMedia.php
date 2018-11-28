<?php


namespace IIIFStorage\Media;


use Omeka\Api\Representation\MediaRepresentation;
use Zend\View\Renderer\PhpRenderer;

trait RenderMedia
{
    protected $currentMedia = null;

    public function render(
        PhpRenderer $view,
        MediaRepresentation $media,
        array $options = []
    ) {
        $this->currentMedia = $media;
        return $this->renderFromData($view, $media->mediaData(), $options);
    }

    public function getCurrentMedia()
    {
        return $this->currentMedia;
    }
}

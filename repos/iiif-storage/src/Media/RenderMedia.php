<?php


namespace IIIFStorage\Media;


use Digirati\OmekaShared\Utility\OmekaValue;
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
        $data = $media->mediaData();

        if ($this instanceof LocalisedMedia) {
            $locale = $data['locale'] ?? null;
            $pageLocale = $this->getLang();
            if (
                $pageLocale &&
                $locale &&
                $locale !== 'default' &&
                OmekaValue::langMatches($locale, $pageLocale) === false
            ) {
                return '';
            }
        }

        return $this->renderFromData($view, $data, $options);
    }

    public function getCurrentMedia()
    {
        return $this->currentMedia;
    }
}

<?php

namespace Digirati\OmekaShared\Framework;

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

        if ($this instanceof TranslatableRenderer) {
            $names = $this->getTranslatableFieldNames();
            /** @var \Zend\I18n\Translator\TranslatorInterface $translator */
            $translator = $media->getServiceLocator()->get('Zend\I18n\Translator\TranslatorInterface')->getDelegatedTranslator();

            foreach ($names as $key) {
                $data[$key] = $translator->translate($data[$key], 'default:page_block');
            }
        }

        if ($this instanceof MediaPageBlockDualRender) {
            return $this->renderFromData($view, $data, $options);
        }

        return '';
    }

    public function getCurrentMedia()
    {
        return $this->currentMedia;
    }
}

<?php

namespace AnnotationStudio\Components;

use IIIF\Model\Canvas;
use IIIF\Model\Manifest;

class CorePlugin implements Component
{
    use WithAttributes;

    private $hasPrinted = false;

    public function getBehaviour(): string
    {
        return 'annotation-studio-core';
    }

    public function __construct(
        Canvas $canvas = null,
        Manifest $manifest = null,
        string $elucidateServer = null,
        string $target = null,
        string $locale = null,
        string $remoteTranslations = null
    ) {
        $this->attributes['manifest'] = $manifest->getId();
        $this->attributes['canvas'] = $canvas ? $canvas->getId() : null;
        $this->attributes['elucidate-server'] = $elucidateServer;
        $this->attributes['target'] = $target ? $target : ($canvas ? 'canvas' : 'manifest');
        $this->attributes['external-locale-config'] = $remoteTranslations;
        if ($locale) {
            $this->attributes['locale'] = $locale;
        }
    }

    public function __toString()
    {
        if ($this->hasPrinted) {
            return '';
        }
        $this->hasPrinted = true;

        // From WithAttributes
        $html = [];
        if (!isset($this->attributes['behaviour'])) {
            $html[] = 'data-behaviour="'.$this->getBehaviour().'"';
        }
        foreach ($this->attributes as $attribute => $value) {
            $html[] = 'data-'.$this->attributeName($attribute).'="'.$this->castValue($value).'"';
        }
        foreach ($this->htmlAttributes as $attribute => $value) {
            $html[] = $attribute.'="'.$value.'""';
        }

        return implode(' ', $html);
    }
}

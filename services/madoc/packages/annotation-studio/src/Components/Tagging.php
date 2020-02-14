<?php

namespace AnnotationStudio\Components;

use IIIF\Model\Canvas;
use IIIF\Model\Manifest;

class Tagging implements Component
{
    use WithAttributes;
    use WithVariations;

    public function __construct(Canvas $canvas, Manifest $manifest, string $captureModel = null)
    {
        $this->attributes['canvas'] = $canvas->getId();
        $this->attributes['manifest'] = $manifest->getId();
        if (null !== $captureModel) {
            $this->attributes['resource-templates'] = $captureModel;
        }
    }

    public function getBehaviour(): string
    {
        return 'annotation-studio-tagging';
    }
}

<?php

namespace AnnotationStudio\Components;

use IIIF\Model\Canvas;

class Transcriber implements Component
{
    use WithAttributes;

    public function __construct(Canvas $canvas, string $resourceTemplate)
    {
        $this->attributes['resource-templates'] = $resourceTemplate;
        $this->attributes['canvas'] = $canvas->getId();
    }

    public function getBehaviour(): string
    {
        return 'annotation-studio-transcriber';
    }
}

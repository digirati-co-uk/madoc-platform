<?php

namespace AnnotationStudio\Components;

use IIIF\Model\Canvas;

class ViewerPlugin implements Component
{
    use WithAttributes;

    public function __construct(
        string $viewer,
        Canvas $canvas
    ) {
        $this->attributes['width'] = $canvas->getWidth();
        $this->attributes['height'] = $canvas->getHeight();
        $this->attributes['viewer'] = $viewer;
    }

    public function getBehaviour(): string
    {
        return 'annotation-studio-viewer';
    }
}

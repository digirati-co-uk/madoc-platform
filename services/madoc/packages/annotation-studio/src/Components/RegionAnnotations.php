<?php

namespace AnnotationStudio\Components;

class RegionAnnotations implements Component
{
    use WithAttributes;

    public function getBehaviour(): string
    {
        return 'annotation-studio-region-annotations';
    }
}

<?php

namespace AnnotationStudio\Components;

class TaggingAnnotation implements Component
{
    use WithAttributes;

    public function getBehaviour(): string
    {
        return 'annotation-studio-tagging-annotations';
    }
}

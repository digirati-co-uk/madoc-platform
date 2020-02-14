<?php

namespace AnnotationStudio\Components;

class Drafts implements Component
{
    use WithAttributes;

    public function getBehaviour(): string
    {
        return 'annotation-studio-drafts';
    }
}

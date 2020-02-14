<?php

namespace AnnotationStudio\Components;

use IIIF\Model\Canvas;
use IIIF\Model\Manifest;

class ResourceEditor implements Component
{
    use WithAttributes;

    public static function withManifest(Manifest $manifest)
    {
        $instance = new static();
        $instance->attributes['manifest'] = $manifest->getId();
        $instance->attributes['target'] = 'manifest';

        return $instance;
    }

    public function __construct(Canvas $canvas = null, string $resourceTemplate = null)
    {
        if ($resourceTemplate) {
            $this->attributes['resource-templates'] = $resourceTemplate;
        }
        if ($canvas) {
            $this->attributes['canvas'] = $canvas->getId();
        }
    }

    public function getBehaviour(): string
    {
        return 'annotation-studio-resource-editor';
    }
}

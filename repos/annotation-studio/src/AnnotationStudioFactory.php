<?php

namespace AnnotationStudio;

use AnnotationStudio\Components\CorePlugin;
use AnnotationStudio\Components\Drafts;
use AnnotationStudio\Components\RegionAnnotations;
use AnnotationStudio\Components\ResourceEditor;
use AnnotationStudio\Components\Tagging;
use AnnotationStudio\Components\TaggingAnnotation;
use AnnotationStudio\Components\Transcriber;
use AnnotationStudio\Components\ViewerPlugin;
use IIIF\Model\Canvas;
use IIIF\Model\Manifest;

class AnnotationStudioFactory
{
    private $instance;
    private $elucidateServer;
    private $manifest;
    private $canvas;
    private $isLocked;
    private $locale = 'en';
    private $remoteTranslations;

    public function __construct(
        AnnotationStudio $instance,
        Manifest $manifest = null,
        Canvas $canvas = null,
        string $version = null
    ) {
        $this->isLocked = $instance->isLocked();
        $this->instance = $instance;
        $this->manifest = $manifest;
        $this->canvas = $canvas;
        if ($version) {
            $this->instance->setVersion($version);
        }
    }

    public static function forManifestPage(Manifest $manifest, AnnotationStudio $annotationStudio = null)
    {
        return new static(
            $annotationStudio ? $annotationStudio : new AnnotationStudio(),
            $manifest
        );
    }

    public static function forCanvasPage(Manifest $manifest, Canvas $canvas, AnnotationStudio $annotationStudio = null)
    {
        return new static(
            $annotationStudio ? $annotationStudio : new AnnotationStudio(),
            $manifest,
            $canvas
        );
    }

    public function setGoogleMapApiKey($key)
    {
        if ($key) {
            $this->instance->setGoogleMapApiKey($key);
        }

        return $this;
    }

    public function atVersion(string $version)
    {
        $this->instance->setVersion($version);
        return $this;
    }

    public function attachElucidateServer($elucidateServer)
    {
        $this->elucidateServer = $elucidateServer;

        return $this;
    }

    public function withViewer($type = 'OpenSeadragonViewer')
    {
        $this->instance->addComponent(
            'viewer',
            new ViewerPlugin(
                $type,
                $this->canvas
            )
        );

        return $this;
    }

    public function withTranscriber($captureModel = null)
    {
        if (!$captureModel) {
            $captureModel = $this->getCaptureModelByType('transcriber');
        }

        $this->instance->addComponent(
            'transcriber',
            new Transcriber($this->canvas, $captureModel)
        );

        return $this;
    }

    public function withResourceEditor($captureModel = null)
    {
        if (!$captureModel) {
            $captureModel = $this->getCaptureModelByType('resource');
        }

        $this->instance->addComponent(
            'editor',
            new ResourceEditor(
                $this->canvas,
                $captureModel
            )
        );

        return $this;
    }

    public function withTagging($captureModel = null)
    {
        if (!$captureModel) {
            $captureModel = $this->getCaptureModelByType('tagging');
        }
        $this->instance->addComponent(
            'taggingEditor',
            new Tagging(
                $this->canvas,
                $this->manifest,
                $captureModel
            )
        );
        $this->instance->addComponent(
            'taggingDisplay',
            new TaggingAnnotation()
        );

        return $this;
    }

    public function withDrafts()
    {
        $this->instance->addComponent(
            'drafts',
            new Drafts()
        );

        return $this;
    }

    public function withRegionAnnotations()
    {
        $this->instance->addComponent(
            'regionAnnotations',
            new RegionAnnotations()
        );

        return $this;
    }

    public function withLocale(string $locale)
    {
        $this->locale = $locale ? $locale : 'en';

        return $this;
    }

    public function withRemoteTranslations(string $url) {
        $this->remoteTranslations = $url;

        return $this;
    }

    public function build(): AnnotationStudio
    {
        $this->instance->addComponent(
            'core',
            new CorePlugin(
                $this->canvas,
                $this->manifest,
                $this->elucidateServer ?? '',
                null,
                $this->locale,
                $this->remoteTranslations
            )
        );

        return $this->instance;
    }

    private function getCaptureModelByType($type): string
    {
        if ($type) {
            return '';
        }
        return '';
    }
}

<?php

namespace IIIFStorage\JsonBuilder;

use IIIF\Model\Canvas;
use IIIFStorage\Model\CanvasRepresentation;
use IIIFStorage\Utility\ApiRouter;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

class CanvasBuilder
{
    use MetadataAggregator;

    /**
     * @var ApiRouter
     */
    private $router;

    /**
     * @var string
     */
    private $siteId;

    /**
     * @var ImageServiceBuilder
     */
    private $imageServiceBuilder;

    public function __construct(ApiRouter $router, ImageServiceBuilder $imageServiceBuilder)
    {
        $this->router = $router;
        $this->imageServiceBuilder = $imageServiceBuilder;
    }

    public function buildResource(ItemRepresentation $canvas, bool $originalIds = false)
    {
        $json = $this->build($canvas, $originalIds);
        $canvasObject = Canvas::fromArray($json);

        return new CanvasRepresentation(
            $canvas,
            $canvasObject,
            $json
        );
    }

    public function build(ItemRepresentation $canvas, bool $originalIds = false): array
    {
        $json = $this->extractSource($canvas);

        $json['@context'] = $json['@context'] ?? 'http://iiif.io/api/presentation/2/context.json';
        if ($originalIds === false) {
            $json['@id'] = $this->router->canvas($canvas->id(), !!$this->siteId);
        }
        $json['@type'] = $json['@type'] ?? 'sc:Canvas';
        $json['o:id'] = $canvas->id();

        $images = array_values(
            array_map(
                function ($image) use ($canvas, $json) {
                    return $this->mapAnnotation($image, $json);
                },
                array_map(
                    [$this->imageServiceBuilder, 'build'],
                    array_filter($canvas->media(), function (MediaRepresentation $mediaItem) {
                        return $mediaItem->ingester() === 'iiif';
                    })
                )
            )
        );

        if (!empty($images)) {
            $json['images'] = $images;
        }


        $manifests = $canvas->value('dcterms:isPartOf', ['all' => true]);
        if (isset($manifests) && !empty($manifests)) {
            /** @var ItemRepresentation[] $manifests */
            $json['partOf'] = array_map(function (ValueRepresentation $value) {
                /** @var ItemRepresentation $manifest */
                $manifest = $value->valueResource();

                return [
                    '@id' => $this->router->manifest($manifest->id(), !!$this->siteId),
                    'label' => $manifest->displayTitle(),
                    '@type' => 'sc:Manifest',
                ];
            }, $manifests);
        }

        /** @var MediaRepresentation $media */
        $media = current(array_filter($canvas->media(), function (MediaRepresentation $m) {
            return $m->hasThumbnails();
        }));

        if ($media) {
            $json['thumbnail'] = [
                '@id' => $media->thumbnailUrl('medium'),
                '@type' => 'dctypes:Image',
                // @todo height and width of thumbnails.
            ];
        }

        return $this->aggregateMetadata($canvas, $json);
    }

    public function mapAnnotation(array $image, array $canvasJson)
    {
        return [
            '@id' => $canvasJson['@id'] . '/annotation',
            '@type' => 'oa:Annotation',
            'motivation' => 'sc:painting',
            'on' => $canvasJson['@id'],
            'resource' => $image,
        ];
    }

    public function setSiteId(string $siteId)
    {
        $this->siteId = $siteId;
    }

    private function extractSource(ItemRepresentation $canvas): array
    {
        /** @var ValueRepresentation $source */
        $source = $canvas->value('dcterms:source');
        if (!$source) {
            return [];
        }
        return json_decode($source->value(), true);
    }

    function getFunctionalFields(): array
    {
        return [
            'dcterms:title' => 'label',
            'dcterms:description' => 'description',
        ];
    }
}

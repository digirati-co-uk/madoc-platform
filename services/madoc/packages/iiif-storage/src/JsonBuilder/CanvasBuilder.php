<?php

namespace IIIFStorage\JsonBuilder;

use Digirati\OmekaShared\Helper\LocaleHelper;
use IIIF\Model\Canvas;
use IIIFStorage\Model\BuiltCanvas;
use IIIFStorage\Model\CanvasRepresentation;
use IIIFStorage\Repository\CanvasRepository;
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
    /**
     * @var LocaleHelper
     */
    private $localeHelper;
    /**
     * @var CanvasRepository
     */
    private $canvas;

    public function __construct(
        ApiRouter $router,
        ImageServiceBuilder $imageServiceBuilder,
        LocaleHelper $localeHelper,
        CanvasRepository $canvas
    ) {
        $this->router = $router;
        $this->imageServiceBuilder = $imageServiceBuilder;
        $this->localeHelper = $localeHelper;
        $this->canvas = $canvas;
    }

    public function buildResource(ItemRepresentation $canvas, bool $originalIds = false)
    {
        $json = $this->build($canvas, $originalIds);
        $canvasObject = Canvas::fromArray($json->getJsonWithStringLabel());

        return new CanvasRepresentation(
            $canvas,
            $canvasObject,
            $json->getJson()
        );
    }

    private $buildCache = [];

    public function build(ItemRepresentation $canvas, bool $originalIds = false): BuiltCanvas
    {
        if (!isset($this->buildCache[$canvas->id()])) {
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
                    '@id' => $media->thumbnailUrl('large'),
                    '@type' => 'dctypes:Image',
                    // @todo height and width of thumbnails.
                ];
            }

            $this->buildCache[$canvas->id()] = new BuiltCanvas(
                $this->aggregateMetadata($canvas, $json),
                $this->getLang()
            );
        }

        return $this->buildCache[$canvas->id()];
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
        return $this->canvas->getSource($canvas->id());
    }

    function getFunctionalFields(): array
    {
        return [
            'dcterms:title' => 'label',
            'dcterms:description' => 'description',
            'sc:attributionLabel' => 'attribution',
            'sc:hasLists' => 'otherContent',
        ];
    }

    function getLang(): string
    {
        return $this->localeHelper->getLocale();
    }
}

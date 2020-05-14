<?php

namespace IIIFStorage\JsonBuilder;

use Digirati\OmekaShared\Helper\LocaleHelper;
use Digirati\OmekaShared\Utility\OmekaValue;
use IIIF\Model\Manifest;
use IIIFStorage\Model\BuiltManifest;
use IIIFStorage\Model\ManifestRepresentation;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\ApiRouter;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

class ManifestBuilder
{
    use MetadataAggregator;

    /**
     * @var string
     */
    private $siteId;

    /**
     * @var ApiRouter
     */
    private $router;
    /**
     * @var ManifestRepository
     */
    private $manifest;
    /**
     * @var CanvasBuilder
     */
    private $canvasBuilder;
    /**
     * @var LocaleHelper
     */
    private $locale;

    public function __construct(
        ApiRouter $router,
        ManifestRepository $manifest,
        CanvasBuilder $canvasBuilder,
        LocaleHelper $locale
    ) {
        $this->router = $router;
        $this->manifest = $manifest;
        $this->canvasBuilder = $canvasBuilder;
        $this->locale = $locale;
    }

    public function buildResource(
        ItemRepresentation $manifest,
        bool $originalIds = false,
        int $page = -1,
        int $perPage = -1
    ) {
        if ($page < 1) {
            $page = 1;
        }
        $builtManifest = $this->build($manifest, $originalIds, $page, $perPage);
        $manifestObject = Manifest::fromArray(
            $builtManifest->getJsonWithStringLabel()
        );

        return new ManifestRepresentation(
            $manifest,
            $manifestObject,
            $builtManifest
        );
    }

    public function build(
        ItemRepresentation $manifest,
        bool $originalIds = false,
        int $page = -1,
        int $perPage = -1
    ): BuiltManifest {
        if ($page < 1) {
            $page = 1;
        }
        $json = $this->extractSource($manifest);

        $json['@context'] = $json['@context'] ?? 'http://iiif.io/api/presentation/2/context.json';
        if ($originalIds === false) {
            $json['@id'] = $this->router->manifest($manifest->id(), !!$this->siteId);
        }
        $json['@type'] = $json['@type'] ?? 'sc:Manifest';
        $json['o:id'] = $manifest->id();

        $canvases = $this->manifest->getCanvases($manifest, $page, $perPage);

        $json['sequences'] = [
            [
                '@id' => $json['@id'] . '/sequence',
                '@type' => 'sc:Sequence',
                'canvases' => array_map(function ($canvas) use ($originalIds, $page, $perPage) {
                    return $canvas ? $this->canvasBuilder->build($canvas, $originalIds)->getJson() : null;
                }, $canvases['canvases']),
            ]
        ];

        $json = $this->aggregateMetadata($manifest, $json);

        return new BuiltManifest(
            $json,
            $canvases['totalResults'],
            $page,
            $perPage,
            $this->getLang()
        );
    }

    public function setSiteId(string $siteId)
    {
        $this->siteId = $siteId;
    }

    private function extractSource(ItemRepresentation $manifest): array
    {
        return $this->manifest->getSource($manifest->id());
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
        return $this->locale->getLocale();
    }
}

<?php

namespace IIIFStorage\JsonBuilder;

use IIIF\Model\Manifest;
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

    public function __construct(ApiRouter $router, ManifestRepository $manifest, CanvasBuilder $canvasBuilder)
    {

        $this->router = $router;
        $this->manifest = $manifest;
        $this->canvasBuilder = $canvasBuilder;
    }

    public function buildResource(ItemRepresentation $manifest)
    {
        $json = $this->build($manifest);
        $manifestObject = Manifest::fromArray($json);

        return new ManifestRepresentation(
            $manifest,
            $manifestObject,
            $json
        );
    }

    public function build(ItemRepresentation $manifest): array
    {
        $json = $this->extractSource($manifest);

        $json['@context'] = $json['@context'] ?? 'http://iiif.io/api/presentation/2/context.json';
        $json['@id'] = $this->router->manifest($manifest->id(), !!$this->siteId);
        $json['@type'] = $json['@type'] ?? 'sc:Manifest';
        $json['o:id'] = $manifest->id();

        $json['sequences'] = [
            [
                '@id' => $json['@id'] . '/sequence',
                '@type' => 'sc:Sequence',
                'canvases' => array_map([$this->canvasBuilder, 'build'], $this->manifest->getCanvases($manifest)),
            ]
        ];

        return $this->aggregateMetadata($manifest, $json);
    }

    public function setSiteId(string $siteId)
    {
        $this->siteId = $siteId;
    }

    private function extractSource(ItemRepresentation $manifest): array
    {
        /** @var ValueRepresentation $source */
        $source = $manifest->value('dcterms:source');
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

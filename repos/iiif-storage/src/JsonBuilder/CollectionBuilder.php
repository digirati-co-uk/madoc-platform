<?php

namespace IIIFStorage\JsonBuilder;


use IIIF\ResourceFactory;
use IIIFStorage\Model\CollectionRepresentation;
use IIIFStorage\Utility\ApiRouter;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

class CollectionBuilder
{
    /**
     * @var ApiRouter
     */
    private $router;
    /**
     * @var ManifestBuilder
     */
    private $manifestBuilder;
    /**
     * @var string
     */
    private $siteId;

    public function __construct(ApiRouter $router, ManifestBuilder $builder)
    {
        $this->router = $router;
        $this->manifestBuilder = $builder;
    }

    use MetadataAggregator;

    public function buildResource(ItemSetRepresentation $omekaCollection): CollectionRepresentation
    {
        $json = $this->build($omekaCollection);
        // Map children.
        $manifestIndex = array_reduce(
            $omekaCollection->value('sc:hasManifests', ['all' => true]),
            function($acc, ValueRepresentation $next) {
                /** @var ItemSetRepresentation $manifest */
                $manifest = $next->valueResource();
                /** @var ValueRepresentation $identifier */
                $identifier = $this->router->manifest($manifest->id());
                $acc[$identifier] = $manifest;
                return $acc;
            }, []
        );
        // Build collection.
        $collection = ResourceFactory::createCollection($json, function ($url) use ($manifestIndex) {
            return $this->manifestBuilder->build($manifestIndex[$url]);
        });

        return new CollectionRepresentation(
            $omekaCollection,
            $collection,
            $json
        );
    }

    public function build(ItemSetRepresentation $collection): array
    {
        $json = $this->extractSource($collection);

        $json['@context'] = $json['@context'] ?? 'http://iiif.io/api/presentation/2/context.json';
        $json['@id'] = $this->router->collection($collection->id(), !!$this->siteId);
        $json['@type'] = $json['@type'] ?? 'sc:Collection';
        $json['o:id'] = $collection->id();

        unset($json['manifests']);
        unset($json['members']);


        /** @var ValueRepresentation[] $hasManifests */
        $hasManifests = $collection->value('sc:hasManifests', ['all' => true]);
        $json['members'] = array_map([$this, 'mapManifest'], $hasManifests) ?? [];

        return $this->aggregateMetadata($collection, $json);
    }

    public function setSiteId(string $siteId)
    {
        $this->siteId = $siteId;
    }

    private function mapManifest(ValueRepresentation $value) {
        /** @var ItemRepresentation $manifest */
        $manifest = $value->valueResource();
        $manifestJson = [
            '@id' => $this->router->manifest($manifest->id(), !!$this->siteId),
            'o:id' => $manifest->id(),
            '@type' => 'sc:Manifest',
            'label' => $manifest->displayTitle(),
        ];

        return $manifestJson;
    }

    private function extractSource(ItemSetRepresentation $collection): array
    {
        /** @var ValueRepresentation $source */
        $source = $collection->value('dcterms:source');
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

<?php

namespace IIIFStorage\JsonBuilder;


use IIIF\Model\Manifest;
use IIIF\ResourceFactory;
use IIIFStorage\Model\BuiltCollection;
use IIIFStorage\Model\CollectionRepresentation;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\ApiRouter;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

class CollectionBuilder
{
    use MetadataAggregator;

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
    /**
     * @var CollectionRepository
     */
    private $collectionRepository;
    /**
     * @var ManifestRepository
     */
    private $manifestRepository;
    /**
     * @var int
     */
    private $perPage;

    public function __construct(
        ApiRouter $router,
        ManifestBuilder $builder,
        ManifestRepository $manifestRepository,
        CollectionRepository $collectionRepository
    ) {
        $this->router = $router;
        $this->manifestBuilder = $builder;
        $this->collectionRepository = $collectionRepository;
        $this->manifestRepository = $manifestRepository;
    }

    public function buildResource(
        ItemSetRepresentation $omekaCollection,
        $originalIds = false,
        int $page = -1,
        int $perPage = -1,
        $numberOfCanvases = -1
    ): CollectionRepresentation {
        if ($page < 1) {
            $page = 1;
        }
        $json = $this->build($omekaCollection, $originalIds, $page, $perPage);
        // Build collection.
        $collection = ResourceFactory::createCollection(
            $json->getJson(),
            function (string $url, Manifest $manifest) use ($originalIds, $numberOfCanvases) {
                $metadata = $manifest->getSource();
                if (!isset($metadata['o:id'])) {
                    // Or try getting by url.
                    return (array)$manifest->getSource();
                }

                return $this->manifestBuilder->build(
                    $this->manifestRepository->getById($metadata['o:id']),
                    $originalIds,
                    0,
                    $numberOfCanvases
                )->getJson();
            }
        );

        return new CollectionRepresentation(
            $omekaCollection,
            $collection,
            $json
        );
    }

    public function build(
        ItemSetRepresentation $collection,
        $originalIds = false,
        int $page = -1,
        int $perPage = -1
    ): BuiltCollection {
        $json = $this->extractSource($collection);

        $json['@context'] = $json['@context'] ?? 'http://iiif.io/api/presentation/2/context.json';
        if ($originalIds === false) {
            $json['@id'] = $this->router->collection($collection->id(), !!$this->siteId);
        }
        $json['@type'] = $json['@type'] ?? 'sc:Collection';
        $json['o:id'] = $collection->id();

        unset($json['manifests']);
        unset($json['members']);

        $hasManifests = [];

        $manifestOmekaMapping =
            ($perPage === -1 || $page === -1)
                ? $this->collectionRepository->getManifestMapFromCollection($collection->id())
                : $this->collectionRepository->getManifestMapFromCollection($collection->id(), $perPage, ($page - 1) * $perPage);

        foreach ($manifestOmekaMapping->getList() as $omekaId) {
            $hasManifests[] = $this->manifestRepository->getById($omekaId);
        }

        $json['members'] = array_map([$this, 'mapManifest'], $hasManifests) ?? [];

        return new BuiltCollection(
            $this->aggregateMetadata($collection, $json),
            $manifestOmekaMapping->getTotalResults(),
            $page,
            $perPage
        );
    }

    public function setSiteId(string $siteId)
    {
        $this->siteId = $siteId;
    }

    private function mapManifest($value)
    {
        /** @var ItemRepresentation $manifest */
        $manifest = $value instanceof ValueRepresentation ? $value->valueResource() : $value;
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

<?php

namespace IIIFStorage\Repository;

use Doctrine\DBAL\Connection;
use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Omeka\Api\Exception\NotFoundException;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\ValueRepresentation;
use Zend\Log\Logger;

class CollectionRepository
{
    const RESOURCE_TEMPLATE = 'IIIF Collection';
    const API_TYPE = 'item_sets';

    const SELECT_MANIFESTS = <<<SQL
 select V2.value_resource_id as omeka_id, V1.uri as uri
 from value V2
        left join value V1 on V1.resource_id = V2.value_resource_id
 WHERE V2.property_id = :hasManifestsId
   AND V1.property_id = 10
   AND V2.resource_id = :resourceId;
SQL;

    const SELECT_MANIFESTS_WITH_LABELS = <<<SQL
 select V2.value_resource_id as omeka_id, V1.uri, V1.value, V1.property_id
 from value V2
        left join value V1 on V1.resource_id = V2.value_resource_id
 WHERE V2.property_id = :hasManifestsId
   AND (V1.property_id = 1 OR V1.property_id = 10)
   AND V2.resource_id = :resourceId;
SQL;

    /**
     * @var Manager
     */
    private $api;

    /**
     * @var PropertyIdSaturator
     */
    private $saturator;

    /**
     * @var string
     */
    private $siteId;
    /**
     * @var Connection
     */
    private $connection;

    public function __construct(Manager $api, PropertyIdSaturator $saturator, Connection $connection)
    {

        $this->api = $api;
        $this->saturator = $saturator;
        $this->connection = $connection;
    }

    public function getPropertyId(): string
    {
        return (string)$this->saturator->getResourceTemplateByName(static::RESOURCE_TEMPLATE)->id();
    }

    public function setSiteId($siteId)
    {
        $this->siteId = $siteId;
    }

    public function getDefaultQuery()
    {
        $query = [
            'resource_template_id' => $this->getPropertyId(),
        ];
        if ($this->siteId) {
            $query['site_id'] = $this->siteId;
        }
        return $query;
    }

    public function getManifestMapFromCollection(int $collectionOmekaId)
    {
        $query = self::SELECT_MANIFESTS;
        $statement = $this->connection->prepare($query);
        $statement->bindValue('hasManifestsId', (int) $this->saturator->loadPropertyId('sc:hasManifests'));
        $statement->bindValue('resourceId', (int) $collectionOmekaId);
        $statement->execute();

        $indexMap = [];
        foreach ($statement->fetchAll() as $manifest) {
            if ($manifest['uri']) {
                $indexMap[$manifest['uri']] = $manifest['omeka_id'];
            }
        }
        return $indexMap;
    }

    public function getById(string $id): ItemSetRepresentation
    {
        $collection = $this->api->read(static::API_TYPE, $id, $this->getDefaultQuery())->getContent();
        if (!$collection) {
            throw new NotFoundException();
        }
        return $collection;
    }

    public function getAll(): array
    {
        return $this->api->search(static::API_TYPE, $this->getDefaultQuery())->getContent();
    }

    public function mutate(string $id, callable $mutation, Logger $logger = null)
    {
        // Get fresh
        $item = $this->getById($id);
        // Turn into request.
        $itemRequest = ItemRequest::fromSource(json_decode(json_encode($item), true));
        // Mutate from params.
        $mutation($itemRequest, $item, $id);
        // Saturate.
        $this->saturator->addPropertyIds($itemRequest);
        // Re-export.
        $toUpdate = $itemRequest->export();
        // Update.
        return $this->api->update(static::API_TYPE, $id, $toUpdate, [], ['isPartial' => true])->getContent();
    }

    public function containsManifest(ItemSetRepresentation $collection, string $manifestId): bool
    {
        $manifests = $collection->value('sc:hasManifests', ['all' => true]);
        foreach ($manifests as $manifestValue) {
            /** @var ValueRepresentation $manifestValue */
            $manifest = $manifestValue->valueResource();
            if ($manifest && (string)$manifest->id() === (string)$manifestId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param string $id
     * @return null|ItemSetRepresentation
     */
    public function getByResource(string $id)
    {
        $items = $this->api->search(static::API_TYPE, [
            'resource_class_id' => $this->saturator->getResourceClassByTerm('sc:Collection')->id(),
            'property' => [
                [
                    'joiner' => 'and',
                    'property' => $this->saturator->loadPropertyId('dcterms:identifier'),
                    'type' => 'eq',
                    'text' => $id,
                ]
            ]
        ])->getContent();

        if (empty($items)) {
            return null;
        }

        /** @var ItemSetRepresentation $collection */
        $item = array_pop($items);

        return $item;
    }

    public function search(string $search): array
    {
        $query = $this->getDefaultQuery();
        $query['search'] = $search;
        return $this->api->search(static::API_TYPE, $query)->getContent();
    }

    /**
     * @param ItemSetRepresentation $collection
     * @return ItemRepresentation[]
     */
    public function getManifests(ItemSetRepresentation $collection)
    {
        $manifests = $collection->value('sc:hasManifests', ['all' => true]);
        return array_map(function (ValueRepresentation $manifestValue) {
            return $manifestValue->valueResource();
        }, $manifests);
    }
}

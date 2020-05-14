<?php

namespace IIIFStorage\Utility;


use Digirati\OmekaShared\Helper\RouteMatchHelper;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DBALException;
use IIIFStorage\Model\PaginatedResult;
use Omeka\Mvc\Exception\NotFoundException;
use PDO;
use Zend\Router\Http\TreeRouteStack;

class CheapOmekaRelationshipRequest
{
    /**
     * @var Connection
     */
    private $connection;

    /**
     * @var PropertyIdSaturator
     */
    private $saturator;
    /**
     * @var TreeRouteStack
     */
    private $routeStack;

    public function __construct(
        Connection $connection,
        PropertyIdSaturator $saturator,
        TreeRouteStack $routeStack
    ) {
        $this->connection = $connection;
        $this->saturator = $saturator;
        $this->routeStack = $routeStack;
    }

    const SELECT_URI_RELATIONSHIP = <<<SQL
SELECT V2.value_resource_id AS omeka_id, V1.uri AS uri
 FROM value V2
        LEFT JOIN value V1 on V1.resource_id = V2.value_resource_id
 WHERE V2.property_id = :termId
   AND V1.property_id = 10
   AND V2.resource_id = :resourceId;
SQL;

    const SELECT_LABEL_RELATIONSHIP_WITH_LIMIT = <<<SQL
SELECT V2.value_resource_id AS omeka_id, V1.uri AS uri
 FROM value V2
        LEFT JOIN value V1 on V1.resource_id = V2.value_resource_id
 WHERE V2.property_id = :termId
   AND V1.property_id = 10
   AND V2.resource_id = :resourceId
LIMIT :lim OFFSET :off;
SQL;
    const SELECT_URI_RELATIONSHIP_COUNT = <<<SQL
SELECT COUNT(V2.value_resource_id) as count
 FROM value V2
        LEFT JOIN value V1 on V1.resource_id = V2.value_resource_id
 WHERE V2.property_id = :termId
   AND V1.property_id = 10
   AND V2.resource_id = :resourceId;
SQL;

    const SELECT_SOURCE = <<<SQL
SELECT value as json, value_resource_id as media_id 
  FROM value 
  WHERE property_id = :termId 
    AND resource_id = :resourceId
SQL;

    const ETAG = <<<SQL
SELECT modified FROM resource WHERE id = :resourceId 
SQL;


    const MANIFEST_LABEL_FROM_CANVAS = <<<SQL
SELECT V2.value_resource_id as omeka_id, MAX(V1.uri) as uri, MAX(V1.value) as label
FROM value V2
       LEFT JOIN value V1 on V1.resource_id = V2.value_resource_id
WHERE V2.property_id = :isPartOfId
  AND (V1.property_id = 1 OR V1.property_id = 10)
  AND V2.resource_id = :canvasId
GROUP BY omeka_id;
SQL;

    const RESOURCE_EXISTS = <<<SQL
    SELECT R.id as id, V1.uri as resourceExists from value as V1
      LEFT JOIN resource R on V1.resource_id = R.id
      WHERE V1.uri = :resourceUri
        AND R.resource_class_id = :resourceClassId
SQL;

    const RESOURCE_ID_FROM_URI = <<<SQL
    SELECT R.id as id from value as V1
      LEFT JOIN resource R on V1.resource_id = R.id
      WHERE V1.uri = :resourceUri
        AND R.resource_class_id = :resourceClassId
SQL;


    /**
     * @param int $fromId
     * @param string $relationTerm
     * @param int $limit
     * @param int $offset
     * @return PaginatedResult
     *
     * @throws DBALException
     */
    public function getUriMapping(int $fromId, string $relationTerm, int $limit = -1, int $offset = 0): PaginatedResult
    {
        $termId = $this->saturator->loadPropertyId($relationTerm);

        $countStatement = $this->connection->prepare(self::SELECT_URI_RELATIONSHIP_COUNT);
        $countStatement->bindValue('termId', (int)$termId, PDO::PARAM_INT);
        $countStatement->bindValue('resourceId', (int)$fromId, PDO::PARAM_INT);
        $countStatement->execute();

        $statement = $this->connection->prepare($limit === -1 ? self::SELECT_URI_RELATIONSHIP : self::SELECT_LABEL_RELATIONSHIP_WITH_LIMIT);
        $statement->bindValue('termId', (int)$termId, PDO::PARAM_INT);
        $statement->bindValue('resourceId', (int)$fromId, PDO::PARAM_INT);
        if ($limit !== -1) {
            $statement->bindValue('lim', (int)$limit, PDO::PARAM_INT);
            $statement->bindValue('off', (int)$offset, PDO::PARAM_INT);
        }
        $statement->execute();

        $countResult = $countStatement->fetch();

        $indexMap = [];
        foreach ($statement->fetchAll() as $canvas) {
            if ($canvas['uri']) {
                if (isset($indexMap[$canvas['uri']])) {
                    error_log('Found duplicate Omeka ID: "' . $canvas['omeka_id'] . '" which is ignored');
                    continue;
                }
                $indexMap[$canvas['uri']] = $canvas['omeka_id'];
            }
        }

        return new PaginatedResult(
            $indexMap,
            $countResult['count'] ?? 0,
            $limit,
            $offset
        );
    }

    public function selectSource(int $fromId)
    {
        $dcTermsSource = $this->saturator->loadPropertyId('dcterms:source');
        $sourceStatement = $this->connection->prepare(self::SELECT_SOURCE);
        $sourceStatement->bindValue('termId', (int)$dcTermsSource, PDO::PARAM_INT);
        $sourceStatement->bindValue('resourceId', (int)$fromId, PDO::PARAM_INT);
        $sourceStatement->execute();

        // Fetch and close.
        $sourceResult = $sourceStatement->fetch();
        $sourceStatement->closeCursor();

        if (!$sourceResult['json'] && $sourceResult['media_id']) {
            $mediaStatement = $this->connection->prepare('SELECT extension, storage_id FROM media WHERE id = :id');
            $mediaStatement->bindValue('id', $sourceResult['media_id'], PDO::PARAM_INT);
            $mediaStatement->execute();
            $mediaItem = $mediaStatement->fetch();
            return json_decode(file_get_contents(OMEKA_PATH . '/files/original/'.$mediaItem['storage_id'] . '.' .$mediaItem['extension']), true);
        }

        return json_decode($sourceResult['json'], true);
    }

    public function getEtag(int $resourceId)
    {
        $statement = $this->connection->prepare(self::ETAG);
        $statement->bindValue('resourceId', $resourceId);
        $statement->execute();

        $result = $statement->fetch();
        $statement->closeCursor();

        if (!$result) {
            throw new NotFoundException('Resource not found');
        }

        return strtotime($result['modified']);
    }

    private $manifestsByCanvasId = [];

    public function getManifestFromCanvas(int $canvasId)
    {
        if (!isset($this->manifestsByCanvasId[$canvasId])) {
            $statement = $this->connection->prepare(self::MANIFEST_LABEL_FROM_CANVAS);
            $statement->bindValue('canvasId', $canvasId);
            $statement->bindValue('isPartOfId', $this->saturator->loadPropertyId('dcterms:isPartOf'));
            $statement->execute();

            $this->manifestsByCanvasId[$canvasId] = $statement->fetch();
        }

        return $this->manifestsByCanvasId[$canvasId]; // keys: [ 'omeka_id', 'uri', 'label']
    }

    /**
     * @param string $manifestUri
     * @param string|null $baseUrl
     * @return int|false
     */
    public function manifestExists(string $manifestUri, string $baseUrl = null)
    {
        return $this->resourceExists('sc:Manifest', $manifestUri, $baseUrl);
    }

    /**
     * @param string $canvasUri
     * @param string|null $baseUrl
     * @return int|false
     */
    public function canvasExists(string $canvasUri, string $baseUrl = null)
    {
        return $this->resourceExists('sc:Canvas', $canvasUri, $baseUrl);
    }

    /**
     * @param string $collectionUri
     * @param string|null $baseUrl
     * @return int|false
     */
    public function collectionExists(string $collectionUri, string $baseUrl = null)
    {
        return $this->resourceExists('sc:Collection', $collectionUri, $baseUrl);
    }

    /**
     * @param string $resource
     * @param string $id
     * @param string|null $baseUrl
     * @return int | false
     */
    private function resourceExists(string $resource, string $id, string $baseUrl = null)
    {
        $match = RouteMatchHelper::matchFrom($this->routeStack, $id, $baseUrl);

        if ($match) {
            $itemId = null;
            switch ($resource) {
                case 'sc:Manifest':
                    $itemId = $match->getParam('manifest');
                    break;
                case 'sc:Canvas':
                    $itemId = $match->getParam('canvas');
                    break;
                case 'sc:Collection':
                    $itemId = $match->getParam('collection');
                    break;
            }
            if ($itemId) {
                try {
                    $this->getEtag((int)$itemId);
                    return (int)$itemId;
                } catch (\Throwable $err) {
                }
            }
        }

        try {
            $statement = $this->connection->prepare(self::RESOURCE_EXISTS);
            $statement->bindValue('resourceUri', $id, PDO::PARAM_STR);
            $statement->bindValue('resourceClassId',
                (int)$this->saturator->getResourceClassByTerm($resource)->id(),
                PDO::PARAM_INT
            );

            $statement->execute();

            $result = $statement->fetch();
            $statement->closeCursor();

            if (!$result) {
                return false;
            }
            return $result['id'];

        } catch (\Throwable $e) {
            error_log((string)$e);
        }
        return false;
    }

    public function getResourceIdByUri(string $resource, string $id): int
    {
        $statement = $this->connection->prepare(self::RESOURCE_ID_FROM_URI);
        $statement->bindValue('resourceUri', $id, PDO::PARAM_STR);
        $statement->bindValue('resourceClassId',
            (int)$this->saturator->getResourceClassByTerm($resource)->id(),
            PDO::PARAM_INT
        );
        $statement->execute();

        $result = $statement->fetch();
        $statement->closeCursor();

        return ($result['id'] ?? null) ? (int)$result['id'] : null;
    }

}

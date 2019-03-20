<?php

namespace IIIFStorage\Utility;


use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Doctrine\DBAL\Connection;
use IIIFStorage\Model\PaginatedResult;
use Omeka\Mvc\Exception\NotFoundException;
use PDO;

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

    public function __construct(
        Connection $connection,
        PropertyIdSaturator $saturator
    ) {
        $this->connection = $connection;
        $this->saturator = $saturator;
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
SELECT value as json 
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


    /**
     * @param int $fromId
     * @param string $relationTerm
     * @param int $limit
     * @param int $offset
     * @return PaginatedResult
     *
     * @throws \Doctrine\DBAL\DBALException
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

}

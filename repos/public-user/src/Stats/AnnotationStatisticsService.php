<?php

namespace PublicUser\Stats;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use PDO;

class AnnotationStatisticsService
{
    /**
     * @var Connection
     */
    private $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function createStatsQuery(): QueryBuilder
    {
        $queryBuilder = $this->connection->createQueryBuilder();
        $queryBuilder->from('item', 'cm');
        $queryBuilder->leftJoin('cm', 'user_canvas_mapping', 'uc', 'uc.canvas_mapping_id = cm.id');

        $queryBuilder->select(
            'SUM(uc.bookmarked) as bookmarked',
            'SUM(uc.complete_count) as complete_count',
            'SUM(uc.incomplete_count) as incomplete_count',
            'SUM(cm.complete) complete_images',
            'SUM(cm.edited) incomplete_images'
        );

        $queryBuilder->where('(uc.bookmarked > 0 OR uc.complete_count > 0 OR uc.incomplete_count > 0)');

        return $queryBuilder;
    }

    public function getGlobalStats()
    {
        $query = $this->createStatsQuery();
        $result = $query->execute()->fetch(PDO::FETCH_ASSOC);

        return new AnnotationStatistics(
            (int) $result['bookmarked'],
            (int) $result['incomplete_count'],
            (int) $result['complete_count'],
            (int) $result['complete_images'],
            (int) $result['incomplete_images']
        );
    }

    public function getUserStats(int $uid)
    {
        $query = $this->createStatsQuery();
        $query->andWhere('uc.user_id = :uid');
        $query->setParameter('uid', $uid);

        $result = $query->execute()->fetch(PDO::FETCH_ASSOC);

        return new AnnotationStatistics(
            (int) $result['bookmarked'],
            (int) $result['incomplete_count'],
            (int) $result['complete_count'],
            (int) $result['complete_images'],
            (int) $result['incomplete_images']
        );
    }
}

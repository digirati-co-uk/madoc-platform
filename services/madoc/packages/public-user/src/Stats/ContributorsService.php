<?php

namespace PublicUser\Stats;

use Doctrine\DBAL\Connection;
use PDO;

class ContributorsService
{
    /**
     * @var Connection
     */
    private $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    /**
     * Get a list of the {@code limit} most active annotation contributors based on total number
     * of annotations.
     *
     * @param int $limit
     *
     * @return array
     */
    public function getTopContributors(int $limit)
    {
        $query = $this->connection->createQueryBuilder();
        $query->select('u.name, u.email');
        $query->from('user_canvas_mapping', 'uc');
        $query->innerJoin('uc', 'user', 'u', 'u.id = uc.user_id');
        $query->innerJoin('uc', 'user', 'cm', 'cm.id = uc.canvas_mapping_id');
        $query->orderBy('SUM(uc.complete_count + uc.incomplete_count)', 'DESC');
        $query->groupBy('uc.user_id');
        $query->setMaxResults($limit);

        return $query->execute()->fetchAll(PDO::FETCH_ASSOC);
    }
}

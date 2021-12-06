<?php

namespace PublicUser\Stats;

use Doctrine\DBAL\Connection;
use GuzzleHttp\Client;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\Model\BuiltCanvas;
use IIIFStorage\Repository\CanvasRepository;
use function GuzzleHttp\Promise\all as all_promises;
use IIIF\Model\Manifest;
use PDO;
use Psr\Http\Message\ResponseInterface;

final class BookmarksService
{
    /**
     * @var Connection
     */
    private $db;

    /**
     * @var Client
     */
    private $http;

    /**
     * @var CanvasRepository
     */
    private $canvasRepository;

    /**
     * @var CanvasBuilder
     */
    private $canvasBuilder;

    public function __construct(Client $http, Connection $db, CanvasRepository $canvasRepo, CanvasBuilder $builder)
    {
        $this->db = $db;
        $this->http = $http;
        $this->canvasRepository = $canvasRepo;
        $this->canvasBuilder = $builder;
    }

    public function getBookmarks(int $uid)
    {
        $query = $this->db->createQueryBuilder();
        $query->from('user_canvas_mapping', 'uc')->select('uc.*', 'cm.*');
        $query->innerJoin('uc', 'item', 'cm', 'cm.id = uc.canvas_mapping_id');
        $query->where('uc.user_id = :uid');
        $query->andWhere('uc.bookmarked != 0');
        $query->setParameter('uid', $uid);

        $resultSet = $query->execute()->fetchAll(PDO::FETCH_ASSOC);

        $canvases = [];
        foreach ($resultSet as $result) {
            $canvases[] = $this->canvasBuilder->build($this->canvasRepository->getById($result['id']));
        }

        return $canvases;
    }
}

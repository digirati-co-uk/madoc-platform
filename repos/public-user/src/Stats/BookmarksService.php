<?php

namespace PublicUser\Stats;

use Doctrine\DBAL\Connection;
use GuzzleHttp\Client;
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

    public function __construct(Client $http, Connection $db)
    {
        $this->db = $db;
        $this->http = $http;
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
        $manifests = [];
        $manifestIris = array_unique(array_column($resultSet, 'manifest_url'));
        $canvasIris = [];

        foreach ($manifestIris as $manifestIri) {
            $manifests[$manifestIri] = $this->http->getAsync($manifestIri)->then(
                function (ResponseInterface $response) {
                    return Manifest::fromJson((string) $response->getBody());
                }
            );
        }

        foreach ($resultSet as $result) {
            $canvasIris[$result['canvas_url']] = $result['item_id'];
        }

        $manifests = all_promises($manifests)->wait(true);

        /** @var Manifest $manifest */
        foreach ($manifests as $manifest) {
            $pos = 0;

            foreach ($manifest->getDefaultSequence()->getCanvases() as $canvas) {
                $canvasId = $canvas->getId();

                if (array_key_exists($canvasId, $canvasIris)) {
                    $canvas->addMetaData([
                        'manifestId' => $manifest->getId(),
                        'omekaId' => $canvasIris[$canvasId],
                        'pos' => $pos,
                    ]);

                    $canvases[$canvasId] = $canvas;
                }

                ++$pos;
            }
        }

        return $canvases;
    }
}

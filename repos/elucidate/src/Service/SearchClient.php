<?php

namespace ElucidateModule\Service;

use Digirati\OmekaShared\Helper\UrlHelper;
use Doctrine\DBAL\Connection;
use ElucidateModule\Domain\Topics\TopicReference;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ServerException;
use Throwable;

class SearchClient
{

    /**
     * @var Client
     */
    private $client;
    /**
     * @var Connection
     */
    private $connection;
    /**
     * @var bool
     */
    private $isSearchEnabled;
    /**
     * @var UrlHelper
     */
    private $urlHelper;

    public function __construct(
        string $searchUrl,
        Connection $connection,
        UrlHelper $urlHelper
    ) {
        $this->isSearchEnabled = !!$searchUrl;
        $this->client = new Client([
            'base_uri' => $searchUrl,
        ]);
        $this->connection = $connection;
        $this->urlHelper = $urlHelper;
    }


    const MANIFEST_URL_TO_OMEKA_ID = <<<SQL
        SELECT V1.resource_id as omeka_id, V2.value as label, V1.value as manifest_uri
        FROM value as V1
               LEFT JOIN value V2 ON V1.resource_id = V2.resource_id
        WHERE V1.value IN (?)
          AND V2.property_id = 1;
SQL;


    public function isSearchEnabled()
    {
        return $this->isSearchEnabled;
    }

    public function makeRequest(string $url, array $query = null)
    {
        try {
            $response = $this->client->get($url, $query ? [
                'query' => $query,
            ] : []);

            $body = (string)$response->getBody();

            return \GuzzleHttp\json_decode($body, true);
        } catch (ServerException $exception) {
            error_log('Error requesting the following: ' . $exception->getRequest()->getUri());
        } catch (Throwable $e) {
            error_log((string)$e);
            return null;
        }
        return null;
    }

    public function userBookmarks(int $userId)
    {
        $url = $this->urlHelper->create('admin/id', ['controller' => 'user', 'id' => $userId], ['force_canonical' => true]);

        $json = $this->makeRequest('/bookmarks/', [
            'user' => $url,
        ]);

        if ($json === null) {
            return $json;
        }

        $omekaJson = $this->addOmekaIds($json['results'] ?? []);

        return [
            'query' => $json['query'] ?? null,
            'totalResults' => $json['count'] ?? 0,
            'totalManifests' => $omekaJson ? count($omekaJson) : 0,
            'json' => $json,
            'searchResults' => $omekaJson
        ];
    }

    public function listTopicsByClass(string $topic)
    {
        $topics = $this->makeRequest('/topic-summary/', [
                'class' => rawurlencode($topic)
            ])[0] ?? null;

        if ($topics === null) {
            return [];
        }

        return array_map(function ($singleTopic) {
            return TopicReference::fromSearchResponse($singleTopic);
        }, $topics[strtolower($topic)] ?? []);
    }

    public function listTopics()
    {
        $topics = $this->makeRequest('/topic-summary/') ?? null;

        if ($topics === null) {
            return [];
        }

        $list = [];
        foreach ($topics as $topicList) {
            foreach ($topicList as $key => $topic) {
                $list[$key] = array_map(function ($singleTopic) {
                    return TopicReference::fromSearchResponse($singleTopic);
                }, $topic);
            }
        }
        return $list;
    }

    public function combinedSearch(string $q)
    {
        $json = $this->makeRequest('/combined/', [
            'query' => rawurlencode($q),
        ]);

        if ($json === null) {
            return $json;
        }

        $omekaJson = $this->addOmekaIds($json['results'] ?? []);

        return [
            'query' => $json['query'] ?? null,
            'totalResults' => $json['count'] ?? 0,
            'totalManifests' => $omekaJson ? count($omekaJson) : 0,
            'json' => $json,
            'searchResults' => $omekaJson
        ];
    }

    public function searchWithinManifest(string $q, string $manifest)
    {
        $json = $this->makeRequest('/combined/', [
            'q' => rawurlencode($q),
            'manifest' => rawurlencode($manifest),
        ]);

        if ($json === null) {
            return null;
        }

        $manifestResults = $json['results'][0]['hits'] ?? [];
        $highlightedCanvases = [];
        foreach ($manifestResults as $canvasResult) {
            $highlightedCanvases[] = $canvasResult['canvas'];
        }
        return $highlightedCanvases;
    }

    public function topicSearch(string $class, string $id)
    {
        $json = $this->makeRequest('/topic/', [
            'q' => implode('/', ['topics', '*', urlencode($id)]),
        ]);

        if ($json === null) {
            return null;
        }

        $omekaJson = $this->addOmekaIds($json['results'] ?? []);

        return [
            'query' => $json['query'] ?? null,
            'totalResults' => $json['count'] ?? 0,
            'totalManifests' => isset($json['results']) ? count($json['results']) : 0,
            'json' => $json,
            'searchResults' => $omekaJson
        ];
    }

    public function addOmekaIds($results)
    {
        $manifestIds = [];
        $indexedResults = [];
        foreach ($results as $manifest) {
            if (isset($manifest['manifest'])) {
                $manifestIds[] = $manifest['manifest'];
                $indexedResults[$manifest['manifest']] = $manifest;
            }
        }
        if (count($manifestIds) === 0) {
            return [];
        }

        $statement = $this->connection->executeQuery(
            static::MANIFEST_URL_TO_OMEKA_ID,
            [$manifestIds],
            [Connection::PARAM_STR_ARRAY]
        );

        $manifests = $statement->fetchAll();
        $indexed = [];
        foreach ($manifests as $manifest) {
            $indexed[$manifest['manifest_uri']] = $manifest;
        }

        $finalManifestList = [];
        foreach ($manifestIds as $id) {
            // Only show manifests that have been added to Omeka.
            if (isset($indexed[$id])) {
                $thumbnailService = $indexedResults[$id]['thumbnail']['service'] ?? null;
                $thumbnails = [];
                if ($thumbnailService) {
                    $thumbId = $thumbnailService['@id'];
                    foreach ($thumbnailService['sizes'] ?? [] as $size) {
                        $thumbnails[] = $thumbId . '/full/' . $size['width'] . ',' . $size['height'] . '/0/default.jpg';
                    }
                }
                $finalManifestList[] = [
                    'id' => $id,
                    'label' => $indexed[$id]['label'] ?? null,
                    'omekaId' => $indexed[$id]['omeka_id'] ?? null,
                    'thumbnail' => $thumbnails[1] ?? $thumbnails[0] ?? null,
                    'canvases' => count($indexedResults[$id]['hits'] ?? []),
                    'notes' => $indexedResults[$id]['count'] ?? 0,
                ];
            }
        }
        return $finalManifestList;
    }


}

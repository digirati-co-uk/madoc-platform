<?php

namespace ElucidateModule\Service;

use ElucidateModule\Domain\Topics\TopicReference;
use GuzzleHttp\Client;

final class TacsiClient
{
    /**
     * @var Client
     */
    private $http;

    /**
     * @var string
     */
    private $url;

    public function __construct(Client $http, string $url)
    {
        $this->http = $http;
        $this->url = $url;
    }

    /**
     * Search for topics that belong to one of the given
     * resource {@code classes}.
     *
     * @param array $parameters
     * @param int   $offset
     * @param int   $limit
     *
     * @return TopicReference[]
     */
    public function search(array $parameters, int $offset = 0, int $limit = 100)
    {
        $query = [
            'from' => $offset,
            'limit' => $limit,
            'sortorder' => 'desc',
            'sort' => 'created',
        ];

        if (isset($parameters['classes'])) {
            $query['class'] = implode(',', $parameters['classes']);
        }

        $response = $this->http->request('GET', $this->url, [
            'query' => $query,
        ]);

        $json = json_decode($response->getBody(), true);
        $items = array_map(
            function (array $data) {
                return new TopicReference(
                    ucfirst(str_replace('%20', ' ', $data['label'])),
                    $data['source'],
                    $data['count']
                );
            },

            $json['topics']
        );

        usort($items, function ($a, $b) {
            return $b->getScore() <=> $a->getScore();
        });

        return $items;
    }
}

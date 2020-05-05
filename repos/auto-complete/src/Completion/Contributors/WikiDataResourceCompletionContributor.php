<?php

namespace AutoComplete\Completion\Contributors;

use Exception;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Promise\PromiseInterface;
use Psr\Http\Message\ResponseInterface;
use AutoComplete\Completion\CompletionContributor;
use AutoComplete\Completion\CompletionItem;

final class WikiDataResourceCompletionContributor implements CompletionContributor
{
    /**
     * @var ClientInterface
     */
    private $httpClient;

    const WIKIDATA_URI = 'https://www.wikidata.org/w/api.php';

    public function __construct(ClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    public function doCompletion(string $term, string... $resourceClasses): PromiseInterface
    {
        $request = $this->httpClient->requestAsync('GET', static::WIKIDATA_URI, [
            'query' => [
                'search' => $term,
                'limit' => '5',
                'action' => 'wbsearchentities',
                'language' => 'en',
                'format' => 'json'
            ]
        ]);

        return $request->then(function (ResponseInterface $response) {
            $content = json_decode((string)$response->getBody(), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Unable to parse response from WIKIDATA endpoint");
            }

            $authoritativeRecords = array_filter(
                $content['search'],

                function (array $record) {
                    return $record['repository'] === 'local';
                }
            );
            
            return array_map(
                function (array $result) {
                    $uri = $result['concepturi'];
                    $text = $result['description'] ?? $result['label'];
                    $tag = $result['id'];

                    return new CompletionItem($uri, $text, $tag);
                },

                $authoritativeRecords
            );
        });
    }

    public function advertises(string $resourceClass): bool
    {
        return strtolower($resourceClass) === 'wikidata';
    }

}

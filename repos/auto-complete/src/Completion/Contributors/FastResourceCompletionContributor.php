<?php

namespace AutoComplete\Completion\Contributors;

use Exception;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Promise\PromiseInterface;
use Psr\Http\Message\ResponseInterface;
use AutoComplete\Completion\CompletionContributor;
use AutoComplete\Completion\CompletionItem;

final class FastResourceCompletionContributor implements CompletionContributor
{
    /**
     * @var ClientInterface
     */
    private $httpClient;

    const FAST_URI = 'http://fast.oclc.org/searchfast/fastsuggest';
    const FAST_REPRESENTATION = 'http://id.worldcat.org/fast/%s';

    public function __construct(ClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    private function getTagName(int $tag)
    {
        switch($tag)
        {
            case 100:
                return "Personal Name"; // @translate
            case 110:
                return "Corporate Name"; // @translate
            case 111:
                return "Event"; // @translate
            case 130:
                return "Uniform Title"; // @translate
            case 148:
                return "Period"; // @translate
            case 150:
                return "Topic"; // @translate
            case 151:
                return "Geographic"; // @translate
            case 155:
                return "Form/Genre"; // @translate
            default:
                return "unknown"; // @translate
        }
    }

    public function doCompletion(string $term, string... $resourceClasses): PromiseInterface
    {
        $request = $this->httpClient->requestAsync('GET', static::FAST_URI, [
            'query' => [
                'query' => $term,
                'queryIndex' => 'suggestall',
                'suggest' => 'autoSubject',
                'queryReturn' => 'auth type suggestall tag idroot',
                'rows' => '20',
            ]
        ]);

        return $request->then(function (ResponseInterface $response) {
            $content = json_decode((string)$response->getBody(), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Unable to parse response from FAST endpoint");
            }

            $authoritativeRecords = array_filter(
                $content['response']['docs'],

                function (array $record) {
                    return $record['type'] === 'auth';
                }
            );

            return array_map(
                function (array $result) {
                    $uri = sprintf(static::FAST_REPRESENTATION, $result['idroot']);
                    $text = $result['auth'];
                    $tag = $this->getTagName((int) $result['tag']);

                    return new CompletionItem($uri, $text, $tag);
                },

                $authoritativeRecords
            );
        });
    }

    public function advertises(string $resourceClass): bool
    {
        return strtolower($resourceClass) === 'fast';
    }
}

<?php

namespace AutoComplete\Completion\Contributors;

use Exception;
use GuzzleHttp\Promise as Promises;
use GuzzleHttp\Promise\PromiseInterface;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use AutoComplete\Completion\CompletionContributor;
use AutoComplete\Completion\CompletionItem;
use Omeka\Api\Representation\ResourceClassRepresentation;

final class OmekaItemCompletionContributor implements CompletionContributor
{
    /**
     * @var Manager
     */
    private $api;
    private $labels;

    public function __construct(Manager $api)
    {
        $this->api = $api;
    }

    public function doCompletion(string $term, string $language, string... $resourceClasses): PromiseInterface
    {
        return Promises\task(function () use ($term, $resourceClasses) {
            $searchResult = $this->api->search('items', [
                'search' => $term,
                'resource_classes' => $resourceClasses
            ]);

            if ($searchResult === false) {
                throw new Exception("Failed to get search results from Omeka API");
            }

            return array_map(
                function (ItemRepresentation $item) {
                    $resourceClass = $item->resourceClass() ? $item->resourceClass()->label() : 'Unknown';
                    return new CompletionItem($item->apiUrl(), $item->displayTitle(), $resourceClass);
                },

                $searchResult->getContent()
            );
        });
    }

    private function getLabels(): array
    {
        if ($this->labels !== null) { // @todo add doctrine cache.
            return $this->labels;
        }

        $resources = $this->api->search('resource_classes');

        return $this->labels = array_map(function (ResourceClassRepresentation $resource) {
            return $resource->label();
        }, $resources->getContent());
    }

    public function advertises(string $resourceClass): bool
    {
        return in_array($resourceClass, $this->getLabels());
    }
}

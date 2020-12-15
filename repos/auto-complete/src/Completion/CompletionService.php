<?php

namespace AutoComplete\Completion;

use Exception;
use GuzzleHttp\Promise;
use GuzzleHttp\Promise\PromiseInterface;
use Traversable;

final class CompletionService
{
    /**
     * @var CompletionContributor[]
     */
    private $contributors;

    public function __construct(CompletionContributor... $contributors)
    {
        $this->contributors = $contributors;
    }

    /**
     * @param string $term The search term to query for completion results on.
     * @param string $language
     * @param string[] $resourceClasses A namespaced vocabulary class to filter search results by.
     * @return Traversable|CompletionItem[] A collection of {@link CompletionItem}s.
     * @throws \Throwable
     */
    public function getSuggestions(string $term, string $language, string... $resourceClasses): array
    {
        if (count($this->contributors) === 0) {
            throw new Exception("No completion contributors are configured");
        }

        /** @var PromiseInterface[] $requests */
        $requests = [];

        foreach ($this->contributors as $contributor) {
            $advertisedResourceClasses = array_filter($resourceClasses, [$contributor, 'advertises']);

            if (count($advertisedResourceClasses) === 0 && count($resourceClasses) !== 0) {
                continue;
            }

            $requests[] = $contributor->doCompletion($term, $language, ...$resourceClasses);
        }

        $responses = Promise\unwrap($requests);
        return array_merge([], ...$responses);
    }
}

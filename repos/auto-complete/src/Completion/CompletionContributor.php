<?php

namespace AutoComplete\Completion;


use GuzzleHttp\Promise\PromiseInterface;

/**
 * A specification for a contributor to completion results on requests for resource suggestions.
 */
interface CompletionContributor
{
    /**
     * Perform an asynchronous search for {@link CompletionItem}s matching the given search {@code term} and
     * {@code resourceClasses}.
     *
     * @param string $term
     * @param string[] ...$resourceClasses
     *
     * @return PromiseInterface
     */
    public function doCompletion(string $term, string... $resourceClasses): PromiseInterface;

    /**
     * Check if this {@link CompletionContributor} advertises completion results for the given {@code resourceClass}.
     *
     * @param string $resourceClass
     * @return bool
     */
    public function advertises(string $resourceClass): bool;

}

<?php

namespace AutoComplete\Completion;

/**
 * A completion item returned from a {@link CompletionContributor}.  Representative of a reference to an external
 * resource.
 */
final class CompletionItem
{
    /**
     * @var string
     */
    private $uri;

    /**
     * @var string
     */
    private $title;

    /**
     * @var string
     */
    private $class;

    /**
     * @var float
     */
    private $score;

    public function __construct(string $uri, string $title, string $class, float $score = 1.0)
    {
        $this->uri = $uri;
        $this->title = $title;
        $this->class = $class;
        $this->score = $score;
    }

    /**
     * @return string
     */
    public function getUri(): string
    {
        return $this->uri;
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @return string
     */
    public function getClass(): string
    {
        return $this->class;
    }

    /**
     * @return float
     */
    public function getScore(): float
    {
        return $this->score;
    }
}
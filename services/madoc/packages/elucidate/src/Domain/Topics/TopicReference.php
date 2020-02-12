<?php

namespace ElucidateModule\Domain\Topics;

/**
 * A remote reference to a {@code topic}, containing only a {@code source} URI and display label.
 */
final class TopicReference
{
    /**
     * @var string
     */
    private $label;
    /**
     * @var string
     */
    private $uri;
    /**
     * @var int
     */
    private $count;

    public function __construct(string $label, string $uri, int $count = 0)
    {
        $this->label = $label;
        $this->uri = $uri;
        $this->count = $count;
    }

    public function getScore(): int
    {
        return $this->count;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getUri(): string
    {
        return $this->uri;
    }
}

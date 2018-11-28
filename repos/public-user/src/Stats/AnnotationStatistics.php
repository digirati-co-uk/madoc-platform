<?php

namespace PublicUser\Stats;

class AnnotationStatistics
{
    /**
     * @var int
     */
    private $incompleteAnnotations;
    /**
     * @var int
     */
    private $completeAnnotations;
    /**
     * @var int
     */
    private $completeImages;
    /**
     * @var int
     */
    private $incompleteImages;

    /**
     * @var int
     */
    private $bookmarks;

    public function __construct(
        int $bookmarks,
        int $incompleteAnnotations,
        int $completeAnnotations,
        int $completeImages,
        int $incompleteImages
    ) {
        $this->bookmarks = $bookmarks;
        $this->incompleteAnnotations = $incompleteAnnotations;
        $this->completeAnnotations = $completeAnnotations;
        $this->completeImages = $completeImages;
        $this->incompleteImages = $incompleteImages;
    }

    /**
     * @return int
     */
    public function getBookmarks(): int
    {
        return $this->bookmarks;
    }

    /**
     * @return int
     */
    public function getIncompleteAnnotations(): int
    {
        return $this->incompleteAnnotations;
    }

    /**
     * @return int
     */
    public function getCompleteAnnotations(): int
    {
        return $this->completeAnnotations;
    }

    /**
     * @return int
     */
    public function getCompleteImages(): int
    {
        return $this->completeImages;
    }

    /**
     * @return int
     */
    public function getIncompleteImages(): int
    {
        return $this->incompleteImages;
    }
}

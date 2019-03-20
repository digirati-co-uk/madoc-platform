<?php

namespace IIIFStorage\Model;


class PaginatedResult
{
    /**
     * @var array
     */
    private $list;
    /**
     * @var int
     */
    private $totalResults;
    /**
     * @var int
     */
    private $limit;
    /**
     * @var int
     */
    private $offset;

    public function __construct(array $list, int $totalResults, $limit = -1, $offset = 0)
    {
        $this->list = $list;
        $this->totalResults = $totalResults;
        $this->limit = $limit;
        $this->offset = $offset;
    }

    /**
     * @return int
     */
    public function getOffset(): int
    {
        return $this->offset;
    }

    /**
     * @return int
     */
    public function getLimit(): int
    {
        return $this->limit;
    }

    /**
     * @return int
     */
    public function getTotalResults(): int
    {
        return $this->totalResults;
    }

    /**
     * @return array
     */
    public function getList(): array
    {
        return $this->list;
    }

}

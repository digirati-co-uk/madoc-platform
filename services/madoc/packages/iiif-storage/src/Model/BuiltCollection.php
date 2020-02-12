<?php

namespace IIIFStorage\Model;

class BuiltCollection
{

    use GetJsonWithStringLabel;

    /**
     * @var array
     */
    private $json;

    /**
     * @var int
     */
    private $totalResults;

    /**
     * @var int
     */
    private $page;

    /**
     * @var int
     */
    private $perPage;
    /**
     * @var string
     */
    private $lang;

    public function __construct(array $json, int $totalResults, int $page, int $perPage, string $lang)
    {

        $this->json = $json;
        $this->totalResults = $totalResults;
        $this->page = $page;
        $this->perPage = $perPage;
        $this->lang = $lang;
    }

    /**
     * @return int
     */
    public function getPerPage(): int
    {
        return $this->perPage;
    }

    /**
     * @return int
     */
    public function getPage(): int
    {
        return $this->page;
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
    public function getJson(): array
    {
        return $this->json;
    }

    public function getLang(): string
    {
        return $this->lang;
    }
}

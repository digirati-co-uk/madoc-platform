<?php

namespace IIIFStorage\Model;


class BuiltCanvas
{
    use GetJsonWithStringLabel;

    /**
     * @var array
     */
    private $json;
    /**
     * @var string
     */
    private $lang;

    public function __construct(array $json, string $lang)
    {
        $this->json = $json;
        $this->lang = $lang;
    }

    public function getJson(): array
    {
        return $this->json;
    }

    public function getLang(): string
    {
        return $this->lang;
    }
}

<?php

namespace ElucidateModule\Domain;

final class AnnotationBody
{
    public $type;
    public $textualBody;
    public $source;

    private function __construct(
        string $type = null,
        string $textualBody = null,
        string $source = null
    ) {
        $this->type = $type;
        $this->textualBody = $textualBody;
        $this->source = $source;
    }

    public static function fromBody($body)
    {
        if (!is_array($body)) {
            return new static();
        }
        if (isset($body['value'])) {
            return new static(null, $body['value']);
        }
        $textualBody = array_filter($body, function ($item) {
            return isset($item['type']) && ('TextualBody' === $item['type'] || 'Text' === $item['type']);
        }) ?? null;
        $specificResource = array_filter($body, function ($item) {
            return isset($item['type']) && 'SpecificResource' === $item['type'];
        }) ?? null;

        $source = current($specificResource) ? current($specificResource)['source'] : null;
        $type = $source ? static::getTypeFromSource($source) : null;

        return new static(
            $type,
            current($textualBody) ? current($textualBody)['value'] : null,
            $source
        );
    }

    private static function getTypeFromSource($source)
    {
        $matches = [];
        preg_match('/\/topics\/(virtual\:)?([A-Za-z\-\_\+].+)\//', $source, $matches);

        return 'entity:'.($matches[2] ?? 'unknown');
    }
}

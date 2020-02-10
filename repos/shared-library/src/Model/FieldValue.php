<?php

namespace Digirati\OmekaShared\Model;

class FieldValue implements ValueInterface
{
    /**
     * @var string
     */
    private $term;
    /**
     * @var int
     */
    private $propertyId;
    /**
     * @var string
     */
    private $type;
    /**
     * @var string
     */
    private $id;
    /**
     * @var string
     */
    private $label;
    /**
     * @var string
     */
    private $value;
    /**
     * @var string
     */
    private $language;
    /**
     * @var string
     */
    private $resourceId;

    public static function entity(string $term, string $id, string $type = 'resource')
    {
        return new static(
            $term,
            null,
            $type,
            null,
            null,
            null,
            null,
            $id
        );
    }

    public static function literalsFromRdf(string $term, string $label, $rdf)
    {
        if (!$rdf) {
            return [];
        }

        if (is_string($rdf)) {
            return [self::literal($term, $label, $rdf)];
        }

        if (isset($rdf['@language']) && isset($rdf['@value'])) {
            return [
                self::literal(
                    $term,
                    $label,
                    $rdf['@value'],
                    $rdf['@language']
                )
            ];
        }

        $literals = [];
        foreach ($rdf as $value) {
            if (isset($value['@language']) && isset($value['@value'])) {
                $literals[] = self::literal(
                    $term,
                    $label,
                    $value['@value'],
                    $value['@language']
                );
            }
        }

        return $literals;
    }

    public static function literal(string $term, string $label, string $value, string $language = null)
    {
        return new static(
            $term,
            null,
            'literal',
            null,
            $label,
            $value,
            $language
        );
    }

    public static function url(string $term, string $label, string $url, string $language = null)
    {
        return new static(
            $term,
            null,
            'uri',
            $url,
            $label,
            null,
            $language
        );
    }

    public function setPropertyId(int $id)
    {
        $this->propertyId = $id;
    }

    public function __construct(
        string $term,
        int $propertyId = null,
        string $type = null,
        string $id = null,
        string $label = null,
        string $value = null,
        string $language = null,
        string $resourceId = null
    ) {
        $this->term = $term;
        $this->propertyId = $propertyId;
        $this->type = $type;
        $this->id = $id;
        $this->label = $label;
        $this->value = $value;
        $this->language = $language;
        $this->resourceId = $resourceId;
    }

    public function getTerm(): string
    {
        return $this->term;
    }

    public static function fromPost(string $property, array $value)
    {
        return new static(
            $property,
            $value['property_id'],
            $value['type'],
            $value['@id'] ?? null,
            $value['o:label'] ?? $value['label'] ??null,
            $value['@value'] ?? null,
            $value['@language'] ?? null,
            $value['value_resource_id'] ?? null
        );
    }

    public function getId()
    {
        return $this->id;
    }

    public function getValue()
    {
        return $this->value ?? '';
    }

    public function export()
    {
        $data = [];
        if ($this->propertyId) {
            $data['property_id'] = (int)$this->propertyId;
        }
        if ($this->type) {
            $data['type'] = $this->type;
        }

        if ($this->id) {
            $data['@id'] = $this->id;
        }

        if ($this->resourceId) {
            $data['value_resource_id'] = (int)$this->resourceId;
        }

        if ($this->language || $this->type === 'literal') {
            $data['@language'] = $this->language ?? '';
        }

        if ($this->value) {
            $data['@value'] = $this->value;
        }
        if ($this->label) {
            $data['o:label'] = $this->label;
        }
        return $data;
    }
}

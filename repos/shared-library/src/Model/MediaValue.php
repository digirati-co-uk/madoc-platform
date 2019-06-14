<?php

namespace Digirati\OmekaShared\Model;

class MediaValue implements ValueInterface
{
    /**
     * @var string
     */
    private $source;
    /**
     * @var string
     */
    private $ingester;
    /**
     * @var FieldValue[]
     */
    private $values;
    /**
     * @var bool
     */
    private $isPublic;

    public function __construct(string $source, string $ingester, $values = [], $isPublic = true)
    {
        $this->source = $source;
        $this->ingester = $ingester;
        $this->values = $values;
        $this->isPublic = $isPublic;
    }

    public static function IIIFImage(string $url, string $label)
    {
        return new static(
            $url,
            'iiif',
            [
                FieldValue::literal('dcterms:title', 'Title', $label)
            ]
        );
    }

    public static function IIIFImageThumbnail(string $url, string $label, string $thumbnailService)
    {
        return new static(
            $url,
            'iiif',
            [
                FieldValue::literal('dcterms:title', 'Title', $label),
                'thumbnail-service' => $thumbnailService,
                'thumbnail-size' => 512,
            ]
        );
    }

    public function addField(FieldValue $fieldValue)
    {
        $this->values[$fieldValue->getTerm()] = $fieldValue;
    }

    public function getFields(): array
    {
        return $this->values;
    }

    public function export()
    {
        $mediaItem = [];

        $mediaItem['o:is_public'] = $this->isPublic;
        $mediaItem['o:source'] = $this->source;
        $mediaItem['o:ingester'] = $this->ingester;

        foreach ($this->values as $key => $value) {
            if ($value instanceof FieldValue) {
                $mediaItem[$value->getTerm()] = $value->export();
            } else {
                $mediaItem[$key] = $value;
            }
        }

        return $mediaItem;
    }
}

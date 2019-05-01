<?php

namespace AnnotationStudio;

use Digirati\OmekaShared\Utility\OmekaValue;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\ValueRepresentation;
use Zend\I18n\Translator\TranslatorInterface;

class OmekaItemExpander
{
    const FIELDS_TO_TRANSLATE = [
        'dcterms:description',
        'dcterms:title',
        'rdfs:label',
        'crowds:uiInputOptions',
        'crowds:group',
        'crowds:uiFormGroup',
    ];

    const FIELDS_TO_EXPAND = ['dcterms:hasPart', 'sc:hasSequences', 'sc:hasCanvases'];
    const FIELD_RENAMED_FROM = 'xx';
    const FIELD_RENAMED_TO = 'oa';

    public static function expandChoices($items, callable $resolveUrl = null, TranslatorInterface $translator = null)
    {
        $itemToReturn = [];
        /** @var $item ValueRepresentation */
        foreach ($items as $k => $item) {
            /** @var $document ItemSetRepresentation */
            $document = $item->valueResource();
            $itemToReturn[] = static::expandDocument($document, $resolveUrl, $translator);
        }

        return $itemToReturn;
    }

    public static function renameField($key)
    {
        return str_replace(static::FIELD_RENAMED_FROM, static::FIELD_RENAMED_TO, $key);
    }

    /**
     * @param ItemSetRepresentation $document
     * @param callable $resolveUrl
     * @param TranslatorInterface|null $translator
     *
     * @return array
     */
    public static function expandDocument($document, callable $resolveUrl = null, TranslatorInterface $translator = null): array
    {
        $item = $document->getJsonLd();
        $jsonLd = [];
        $locale = $translator->getDelegatedTranslator()->getLocale();

        foreach ($item as $key => $field) {
            $key = static::renameField($key);

            if (in_array($key, static::FIELDS_TO_EXPAND)) {
                $jsonLd[$key] = static::expandChoices($field, $resolveUrl, $translator);
            } elseif (in_array($key, static::FIELDS_TO_TRANSLATE) && is_array($field)) {
                $jsonLd[$key] = $field;
                $first = reset($field);

                if (1 === count($field) && $first instanceof ValueRepresentation
                    && 'literal' === $first->type()) {
                    $jsonLd[$key] = self::toJsonValue($first, $translator);
                } elseif ('uri' === $first->type()) {
                    // Can't translate URI.
                    $jsonLd[$key] = $field;
                } else {
                    $jsonLd[$key] = OmekaValue::translateValue($document, $key, $locale)->value();
                }
            } else {
                $jsonLd[$key] = $field;
            }
        }

        return static::addMissingIds($jsonLd, $document, $resolveUrl);
    }

    private static function toJsonValue($field, $translator)
    {
        $json = $field->jsonSerialize();
        $value = $json['@value'];

        return null !== $translator ? $translator->translate($value) : $value;
    }

    /**
     * @param array                 $jsonLd
     * @param callable              $resolveUrl
     * @param ItemSetRepresentation $document
     *
     * @return array
     */
    public static function addMissingIds($jsonLd, $document, callable $resolveUrl = null): array
    {
        $jsonLd['@id'] = $resolveUrl ? $resolveUrl($document->id(), $document) : $document->apiUrl();
        $jsonLd['o:id'] = $document->id();

        return $jsonLd;
    }
}

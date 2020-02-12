<?php

namespace Digirati\OmekaShared\Utility;


use Locale;
use LogicException;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

class OmekaValue
{

    private function __construct()
    {
    }

    public static function toRdfEntity($representation, $term, $type)
    {
        /** @var ValueRepresentation[] $values */
        $values = $representation->values()[$term]['values'];

        $urlValues = array_filter($values, function (ValueRepresentation $value) {
            return $value->type() === 'uri';
        });

        return array_map(function (ValueRepresentation $value) use ($type) {
            return [
                "@id" => $value->uri(),
                "@type" => $type,
                "label" => $value->value(),
            ];

        }, $urlValues);
    }

    public static function toRdf($representation, $term, $getLabel = false)
    {
        /** @var ValueRepresentation[] $values */
        $values = $representation->values()[$term]['values'];

        if (count($values) === 1) {
            $value = $values[0];
            $concreteValue = $getLabel ? $value->property()->label() : $value->value();

            if ($value->lang()) {
                return ['@value' => $concreteValue, '@language' => $value->lang()];
            }

            return $concreteValue;
        }


        return array_map(function (ValueRepresentation $value) use ($getLabel) {
            $concreteValue = $getLabel ? $value->property()->label() : $value->value();
            return $value->lang()
                ? ['@value' => $concreteValue, '@language' => $value->lang()]
                : $concreteValue;
        }, $values);
    }

    public static function translateValue($representation, $term, $lang = '')
    {
        if (!$representation instanceof ItemRepresentation && !$representation instanceof ItemSetRepresentation) {
            throw new LogicException('Only Items and ItemSets can be translated.');
        }

        $values = $representation->values()[$term]['values'];
        $fallback = $values[0] ?? null;

        foreach ($representation->values()[$term]['values'] as $value) {
            /** @var ValueRepresentation $value */
            // Perfect match, return.
            if ($value->lang() === $lang) {
                return $value;
            }
            // Check if they match each other, in either direction.
            if (self::langMatches($value->lang(), $lang)) {
                $fallback = $value;
            }
        }

        // Fallback found, then return that.
        return $fallback;
    }

    public static function langMatches($langA, $langB)
    {
        if (!$langA || !$langB) {
            return false;
        }
        if ($langA === $langB) {
            return true;
        }
        $valueLanguage = Locale::parseLocale($langA)['language'] ?? null;

        // Check if they match each other, in either direction.
        return (
            Locale::filterMatches($langA, $langB) ||
            Locale::filterMatches($langB, $langA) ||
            // When checking es-ES vs. es-MX for example, we need to check just the language.
            ($valueLanguage && Locale::filterMatches($langB, $valueLanguage))
        );
    }

}

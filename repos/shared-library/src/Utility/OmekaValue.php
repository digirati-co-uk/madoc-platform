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

    public static function toRdf($representation, $term, $getLabel = false)
    {
        /** @var ValueRepresentation[] $values */
        $values = $representation->values()[$term]['values'];

        if (count($values) === 1) {
            $value = $values[0];
            $concreteValue = $getLabel ? $value->property()->label() : $value->value();

            if ($value->lang()) {
                return ['@language' => $value->lang(), '@value' => $concreteValue];
            }

            return $concreteValue;
        }


        return array_map(function (ValueRepresentation $value) use ($getLabel) {
            $concreteValue = $getLabel ? $value->property()->label() : $value->value();
            return $value->lang()
                ? ['@language' => $value->lang(), '@value' => $concreteValue]
                : $concreteValue;
        }, $values);
    }

    public static function translateValue($representation, $term, $lang = '')
    {
        if (!$representation instanceof ItemRepresentation && !$representation instanceof ItemSetRepresentation) {
            throw new LogicException('Only Items and ItemSets can be translated.');
        }

        $values = $representation->values()[$term]['values'];
        $fallback = $values[0];

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

    static public function langMatches($langA, $langB)
    {
        if ($langA === $langB) {
            return true;
        }
        $valueLanguage = Locale::parseLocale($langA)['language'] ?? null;

        // Check if they match each other, in either direction.
        return (
            $langA &&
            (
                Locale::filterMatches($langA, $langB) ||
                Locale::filterMatches($langB, $langA) ||
                // When checking es-ES vs. es-MX for example, we need to check just the language.
                ($valueLanguage && Locale::filterMatches($langB, $valueLanguage))
            )
        );
    }

}

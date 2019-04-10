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

            $valueLanguage = Locale::parseLocale($value->lang())['language'];
            // Check if they match each other, in either direction.
            if (
                $value->lang() &&
                (
                    Locale::filterMatches($value->lang(), $lang) ||
                    Locale::filterMatches($lang, $value->lang()) ||
                    // When checking es-ES vs. es-MX for example, we need to check just the language.
                    Locale::filterMatches($lang, $valueLanguage)
                )
            ) {
                $fallback = $value;
            }
        }

        // Fallback found, then return that.
        return $fallback;
    }

}

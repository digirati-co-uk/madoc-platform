<?php

namespace Digirati\OmekaShared\Utility;


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

        // Examples of input/output:
        // en-gb -> en
        // en-us -> en
        // en    -> en
        // cy-gb -> cy
        $primaryLang = explode('-', $lang)[0] ?? $lang;

        $values = $representation->values()[$term]['values'];
        $fallback = $values[0];

        foreach ($representation->values()[$term]['values'] as $value) {
            /** @var ValueRepresentation $value */
            // Perfect match, return.
            if ($value->lang() === $lang) {
                return $value;
            }
            // Sub-optimal, but partial match.
            if (substr($value->lang(), 0, strlen($primaryLang)) === $primaryLang) {
                $fallback = $value;
            }
        }

        // Fallback found, then return that.
        return $fallback;
    }

}

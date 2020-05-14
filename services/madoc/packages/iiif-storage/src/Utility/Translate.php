<?php

namespace IIIFStorage\Utility;

trait Translate {
    /**
     * @todo this needs to be implemented.
     * @param $objOrString
     * @return mixed
     */
    private function translate($objOrString) {
        if (is_string($objOrString)) {
            return $objOrString;
        }

        if (!empty($objOrString)) {
            foreach ($objOrString as $candidate) {
                if ($candidate['@language'] === 'en') {
                    return $candidate['@value'];
                }
            }
        }

        return $objOrString[0]['@value'] ?? '';
    }
}

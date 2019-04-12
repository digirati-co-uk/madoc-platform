<?php

namespace Digirati\OmekaShared\Helper;

use Digirati\OmekaShared\Utility\OmekaValue;
use Zend\View\Helper\AbstractHelper;

class LocaleFromRdf extends AbstractHelper
{
    /**
     * @var LocaleHelper
     */
    private $localeHelper;

    public function __construct(
        LocaleHelper $localeHelper
    ) {
        $this->localeHelper = $localeHelper;
    }

    public function __invoke($rdf)
    {
        if (is_string($rdf) || empty($rdf)) {
            return $rdf;
        }

        if (isset($rdf['@value']) && is_string($rdf['@value'])) {
            return $rdf['@value'];
        }

        $locale = $this->localeHelper->getLocale();

        $fallback = current($rdf);
        foreach ($rdf as $value) {
            $lang = $value['@language'] ?? null;
            $value = $value['@value'] ?? null;
            if ($lang === $locale) {
                return $value;
            }
            if (
                OmekaValue::langMatches($locale, $lang)
            ) {
                $fallback = $value;
            }
        }
        return $fallback;
    }
}

<?php

namespace Digirati\OmekaShared\Helper;

use Omeka\I18n\Translator;

class LocaleHelper
{

    /**
     * @var Translator
     */
    private $translator;

    /**
     * LocaleHelper constructor.
     *
     * @param Translator $translator
     */
    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    /**
     * @return \Zend\I18n\Translator\Translator
     */
    public function getTranslator()
    {
        /** @var \Zend\I18n\Translator\Translator $translator */
        $translator = $this->translator->getDelegatedTranslator();
        return $translator;
    }

    /**
     * @return string
     */
    public function getLocale()
    {
        return $this->getTranslator()->getLocale();
    }

    /**
     * @param string $locale
     */
    public function setLocale(string $locale)
    {
        if (!$locale) {
            return;
        }
        $this->getTranslator()->setLocale($locale);
    }

}

<?php

namespace i18n\Translator;

use Zend\Mvc\I18n\Translator as MvcTranslator;

class NavigationTranslator extends MvcTranslator
{
    /**
     * @var ContextualTranslator
     */
    private $contextualTranslator;

    public function __construct(ContextualTranslator $contextualTranslator)
    {
        parent::__construct($contextualTranslator);
        $this->contextualTranslator = $contextualTranslator;
    }

    /**
     * Translate a message.
     *
     * @param string $message
     * @param string $textDomain
     * @param string $locale
     *
     * @return string
     */
    public function translate($message, $textDomain = 'default', $locale = null)
    {
        return $this->contextualTranslator->translateResource($message, 'navigation', null, $locale);
    }
}

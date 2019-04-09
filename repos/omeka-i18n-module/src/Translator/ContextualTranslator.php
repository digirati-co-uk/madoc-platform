<?php

namespace i18n\Translator;

use i18n\Resource\TranslatableResourceIdentifier;
use Omeka\Api\Representation\SiteRepresentation;
use Zend\I18n\Translator\TranslatorInterface;

class ContextualTranslator implements TranslatorInterface
{
    private $translator;
    private $resource;
    private $id;
    private $context;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * Set the current context (site) this translator is targetting.
     *
     * @param SiteRepresentation $site
     */
    public function setSite(SiteRepresentation $site)
    {
        $this->context = $site->slug();
    }

    /**
     * Set the type and id of the resource being currently translated.
     *
     * @param string $resource
     * @param string $id
     */
    public function setResource($resource, $id = null)
    {
        $this->resource = $resource;
        $this->id = $id;
    }

    /**
     * @param string $message
     * @param string $textDomain
     * @param string $locale
     *
     * @return string
     */
    public function translate($message, $textDomain = 'default', $locale = null)
    {
        if (null !== $this->context) {
            $id = TranslatableResourceIdentifier::forResource($this->resource, $this->id)->setProject($this->context);
            $domain = (string) $id;
        }

        return $this->translator->translate($message, $domain, $locale);
    }

    public function translateResource($message, $resource, $id = null, $locale = null)
    {
        $domain = 'default';

        if (null !== $this->context) {
            $id = TranslatableResourceIdentifier::forResource($resource, $id)->setProject($this->context);
            $domain = (string) $id;
        }

        return $this->translator->translate($message, $domain, $locale);
    }

    /**
     * Translate a plural message.
     *
     * @param string      $singular
     * @param string      $plural
     * @param int         $number
     * @param string      $textDomain
     * @param string|null $locale
     *
     * @return string
     */
    public function translatePlural(
        $singular,
        $plural,
        $number,
        $textDomain = 'default',
        $locale = null
    ) {
        return $this->translator->translatePlural($singular, $plural, $number, $textDomain, $locale);
    }
}

<?php

namespace i18n\Loader;

use BabDev\Transifex\Translations;
use GuzzleHttp\Exception\ClientException;
use Symfony\Component\Translation\Loader\PoFileLoader;
use Zend\I18n\Translator\Loader\RemoteLoaderInterface;
use Zend\I18n\Translator\TextDomain;
use Zend\Json\Json;
use Zend\Log\LoggerInterface;

abstract class AbstractTransifexMessageLoader implements RemoteLoaderInterface
{
    /**
     * @var Translations
     */
    private $translations;

    /**
     * @var LoggerInterface
     */
    private $logger;

    public function __construct(LoggerInterface $logger, Translations $translations)
    {
        $this->logger = $logger;
        $this->translations = $translations;
    }

    /**
     * Load translations from a remote source.
     *
     * @param string $locale
     * @param string $textDomain
     *
     * @return \Zend\I18n\Translator\TextDomain|null
     */
    public function load($locale, $textDomain)
    {
        $domain = new TextDomain();
        $identity = $this->identifyResource($locale, $textDomain);
        if (null === $identity) {
            return $domain;
        }

        list($project, $resource) = $identity;

        if (null === $project || null === $resource) {
            $this->logger->info("Unable to find project or resource for the id: $textDomain");

            return $domain;
        }

        try {
            $translationsResponse = $this->translations->getTranslation($project, $resource, $locale, 'translator');
            if (200 !== $translationsResponse->getStatusCode()) {
                return $domain;
            }

            $translationsBody = (string) $translationsResponse->getBody();

            if ('text/x-po' === $translationsResponse->getHeaderLine('Content-Type')) {
                $outputName = tempnam(sys_get_temp_dir(), 'i18n').'.po';
                file_put_contents($outputName, $translationsBody);

                $loader = new PoFileLoader();
                $catalogue = $loader->load($outputName, $locale, $textDomain);

                foreach ($catalogue->all('default') as $key => $value) {
                    $domain[$key] = $value;
                }
            } else {
                $translations = Json::decode($translationsBody, Json::TYPE_ARRAY);

                foreach ($translations as $key => $message) {
                    $domain[$key] = $message;
                }
            }
        } catch (ClientException $ex) {
            $this->logger->err("Unable to retrieve translations for text domain: '$textDomain'", [
                'message' => $ex->getMessage(),
            ]);
        }

        return $domain;
    }

    /**
     * Identify the the Project and Resource used to map a {@link TextDomain} to Transifex.
     *
     * @param string $locale
     * @param string $textDomain
     *
     * @return array
     */
    abstract public function identifyResource($locale, $textDomain);
}

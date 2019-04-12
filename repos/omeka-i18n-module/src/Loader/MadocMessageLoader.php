<?php

namespace i18n\Loader;

use Digirati\OmekaShared\Utility\OmekaValue;
use FilesystemIterator;
use RegexIterator;
use Symfony\Component\Translation\Loader\PoFileLoader;
use Zend\I18n\Translator\Loader\RemoteLoaderInterface;
use Zend\I18n\Translator\TextDomain;

class MadocMessageLoader implements RemoteLoaderInterface
{
    /**
     * Load translations from a remote source.
     *
     * @param  string $locale
     * @param  string $textDomain
     * @return \Zend\I18n\Translator\TextDomain|null
     */
    public function load($locale, $textDomain)
    {
        $domain = new TextDomain();
        $loader = new PoFileLoader();

        // @todo is this the right thing to do?
        $iterator = new FilesystemIterator(__DIR__ . "/../../../../translations");
        $filter = new RegexIterator($iterator, '/.(po)$/');

        $fallback = null;
        $catalogue = null;

        foreach($filter as $entry) {
            $name = $entry->getBasename('.po');
            list(, $fileLocale) = explode('.', $name);

            if ($fileLocale === $locale) {
                $catalogue = $loader->load($entry->getPathName(), $locale, $textDomain);
            }
            if (OmekaValue::langMatches($locale, $fileLocale)) {
                $fallback = $entry->getPathName();
            }
        }

        if (!$catalogue && !$fallback) {
            return $domain;
        }

        if (!$catalogue) {
            $catalogue = $loader->load($fallback, $locale, $textDomain);
        }

        foreach ($catalogue->all($textDomain) as $key => $value) {
            $domain[$key] = $value;
        }

        return $domain;
    }
}

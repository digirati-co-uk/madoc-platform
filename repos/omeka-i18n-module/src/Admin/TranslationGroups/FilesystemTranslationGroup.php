<?php

namespace i18n\Admin\TranslationGroups;


use Digirati\OmekaShared\Utility\OmekaValue;
use FilesystemIterator;
use Locale;
use RegexIterator;
use Symfony\Component\Translation\Loader\PoFileLoader;
use Zend\I18n\Translator\TextDomain;

abstract class FilesystemTranslationGroup implements TranslationGroup
{
    abstract function getPath(): string;

    public function listLanguages()
    {
        if (!file_exists($this->getPath())) {
            return [];
        }

        $iterator = new FilesystemIterator($this->getPath());
        $filter = new RegexIterator($iterator, '/.(po)$/');

        $locales = [];
        foreach ($filter as $entry) {
            $name = $entry->getBasename('.po');
            $locales[] = [
                'label' => Locale::getDisplayName($name, $name),
                'code' => $name
            ];
        }

        return $locales;
    }

    public function getTemplate()
    {
        if (!$this->hasTemplate()) {
            return [];
        }

        $loader = new PoFileLoader();
        $catalogue = $loader->load($this->getPath() . '/template.pot', 'en_US');

        $domain = [];
        foreach ($catalogue->all() as $key => $value) {
            $domain[$key] = $value;
        }

        return $domain['messages'];
    }

    public function hasTemplate()
    {
        return file_exists($this->getPath() . '/template.pot');
    }

    public function getLanguage(string $locale, bool $onlyMissing = false)
    {
        $textDomain = 'default';
        $domain = new TextDomain();
        $loader = new PoFileLoader();

        $iterator = new FilesystemIterator($this->getPath());
        $filter = new RegexIterator($iterator, '/.(po)$/');

        $fallback = null;
        $catalogue = null;

        foreach($filter as $entry) {
            $name = $entry->getBasename('.po');

            if ($name === $locale) {
                $catalogue = $loader->load($entry->getPathName(), $locale, $textDomain);
            }
            if (OmekaValue::langMatches($locale, $name)) {
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

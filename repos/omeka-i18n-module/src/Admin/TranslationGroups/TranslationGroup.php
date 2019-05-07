<?php

namespace i18n\Admin\TranslationGroups;

use Psr\Http\Message\ResponseInterface;

interface TranslationGroup
{
    public function getId();
    public function getLabel();
    public function listLanguages();
    public function getTemplate();
    public function reportOptions();
    public function export($language = null): ResponseInterface;
    public function getLanguage(string $lang, bool $onlyMissing = false);
    public function getStatistics();
    public function isVirtual();
    public function hasTemplate();
    public function getDescription();
}

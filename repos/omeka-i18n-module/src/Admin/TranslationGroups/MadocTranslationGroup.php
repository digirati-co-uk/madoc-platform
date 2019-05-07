<?php

namespace i18n\Admin\TranslationGroups;

use i18n\Admin\ReportOptions\GithubReportOption;
use Psr\Http\Message\ResponseInterface;

class MadocTranslationGroup extends FilesystemTranslationGroup implements TranslationGroup
{

    public function getLabel()
    {
        return 'Madoc translations'; // @translate
    }

    public function getDescription()
    {
        return 'Madoc translations are shipped as part of the core Madoc Platform. They include strings for all of the default templates for pages, page blocks, media items. This also is where the default theme is translated. You can contribute or request new translations on Github via the link below'; // @translate
    }

    public function reportOptions()
    {
        return [
            new GithubReportOption('digirati-co-uk', 'madoc-platform'),
        ];
    }

    public function export($language = null): ResponseInterface
    {
        return null;
    }

    public function getStatistics()
    {
        return [];
    }

    public function isVirtual()
    {
        return false;
    }

    function getPath(): string
    {
        return OMEKA_PATH . '/translations/madoc';
    }

    public function getId()
    {
        return 'madoc';
    }
}

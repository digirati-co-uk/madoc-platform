<?php

namespace i18n\Admin\TranslationGroups;

use i18n\Admin\ReportOptions\GithubReportOption;
use Psr\Http\Message\ResponseInterface;

class OmekaTranslationGroup extends FilesystemTranslationGroup implements TranslationGroup
{

    public function reportOptions()
    {
        return [
            new GithubReportOption('omeka', 'omeka-s'),
        ];
    }

    public function export($language = null): ResponseInterface
    {
        // If no language, return .pot file.

        // If language, check if it exists, and return that.

        // otherwise.. .pot file again
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

    public function getLabel()
    {
        return 'Omeka-S translations';
    }

    function getPath(): string
    {
        return OMEKA_PATH . '/application/language';
    }

    public function getId()
    {
        return 'omeka-core';
    }

    public function getDescription()
    {
        return 'These translations are shipped as part of Omeka-S. You can request new translations from them, or add your own into madoc and copy them into your configuration. Please check the documentation for details on how to do this.'; // @translate
    }
}

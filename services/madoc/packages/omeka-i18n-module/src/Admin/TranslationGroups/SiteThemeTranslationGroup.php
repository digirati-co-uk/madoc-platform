<?php

namespace i18n\Admin\TranslationGroups;

use Omeka\Api\Representation\SiteRepresentation;
use Psr\Http\Message\ResponseInterface;

class SiteThemeTranslationGroup extends FilesystemTranslationGroup implements TranslationGroup
{

    /**
     * @var SiteRepresentation
     */
    private $site;
    /**
     * @var string
     */
    private $theme;
    /**
     * @var string
     */
    private $themePath;
    /**
     * @var array
     */
    private $themeData;

    public function __construct(SiteRepresentation $site)
    {
        $this->site = $site;
        $this->theme = $site->theme();
        $this->themePath = OMEKA_PATH . '/themes/' . $this->theme;
        $this->themeData = parse_ini_file($this->themePath . '/config/theme.ini');
    }

    public function getLabel()
    {
        return $this->themeData['name'] . ' (theme)' ?? 'Untitled theme';
    }

    public function reportOptions()
    {
        return [];
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
        return $this->themePath . '/translations';
    }

    public function getId()
    {
        return 'theme';
    }

    public function getDescription()
    {
        return 'You can see any translations that are part of your current theme here. Please contact the theme developer to request translations or you can download the template, if available, and provide your own. (note: Madoc default theme is part of the core madoc translations)'; // @translate
    }
}

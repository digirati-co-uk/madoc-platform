<?php

namespace i18n\Admin\TranslationGroups;

use Omeka\Api\Representation\SiteRepresentation;
use Psr\Http\Message\ResponseInterface;

class SiteNavigationTranslationGroup extends FilesystemTranslationGroup implements TranslationGroup
{
    /**
     * @var SiteRepresentation
     */
    private $site;

    public function __construct(SiteRepresentation $site)
    {
        $this->site = $site;
    }

    function getPath(): string
    {
        return OMEKA_PATH . '/translations/s/' . $this->site->slug() . '/navigation';
    }

    public function getLabel()
    {
        return $this->site->title() . ' site navigation';
    }

    public function getTemplate()
    {
        $navigation = $this->site->navigation();

        return array_reduce($navigation, [$this, 'parseNavLevel'], []);
    }

    private function parseNavLevel($acc, $nav, $level = 0)
    {
        if (isset($nav['data']['label']) && $nav['data']['label']) {
            $acc[$nav['data']['label']] = '';
        }

        if (isset($nav['links'])) {
            return array_reduce($nav['links'], function($accInner, $nextNav) use ($level) {
                return $this->parseNavLevel($accInner, $nextNav, $level + 1);
            }, $acc);
        }

        return $acc;
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
        return true;
    }

    public function getId()
    {
        return 'navigation';
    }

    public function getDescription()
    {
        return 'You can translate your sites navigation here. This is currently the only way to translate navigation items as it is currently not possible inside of the Omeka-S user interface.'; // @translate
    }
}

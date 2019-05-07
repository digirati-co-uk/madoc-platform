<?php

namespace i18n\Admin\TranslationGroups;


use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Media\Renderer\Manager;
use Psr\Http\Message\ResponseInterface;

class PageTranslationGroup extends FilesystemTranslationGroup implements TranslationGroup
{

    /**
     * @var SiteRepresentation
     */
    private $site;
    /**
     * @var Manager
     */
    private $manager;

    public function __construct(
        SiteRepresentation $site,
        Manager $manager
    )
    {
        $this->site = $site;
        $this->manager = $manager;
    }

    function getPath(): string
    {
        return OMEKA_PATH . '/translations/s/' . $this->site->slug() . '/page-blocks';
    }

    public function getTemplate()
    {
        $template = [];
        $pages = $this->site->pages();
        foreach ($pages as $page) {
            foreach ($page->blocks() as $block) {
                /** @var SitePageBlockRepresentation $block */
                $blockRenderer = $this->manager->get($block->layout());
                if (!method_exists($blockRenderer, 'getTranslatableFieldNames')) {
                    continue;
                }
                $fieldNames = $blockRenderer->getTranslatableFieldNames() ?? [];
                if (!is_array($fieldNames)) {
                    continue;
                }
                $blockData = $block->data();
                $locale = $blockData['locale'] ?? null;

                if ($locale && $locale !== 'default' ) {
                    continue;
                }

                foreach ($fieldNames as $name) {
                    if (isset($blockData[$name])) {
                        $template[$blockData[$name]] = '';
                    }
                }
            }
        }
        return $template;
    }

    public function getBlockCount()
    {
        $count = 0;
        foreach ($this->site->pages() as $page) {
            $count += count($page->blocks());
        }
        return $count;
    }

    public function getId()
    {
        return 'pages';
    }

    public function getLabel()
    {
        return $this->site->title() . ' site pages (' . $this->getBlockCount() . ' blocks)';
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

    public function getDescription()
    {
        return 'Pages can be translated most inside of Omeka, but you can also choose to translate them externally. To do this, when adding page blocks, simply leave the Language field as "Default". This will ensure that it displays for all locales. Any blocks that are marked with a "Default" language and have translatable fields will show up here.'; // @translate
    }
}

<?php

namespace Digirati\OmekaShared\Framework;

use Digirati\OmekaShared\Helper\LocaleHelper;
use Digirati\OmekaShared\Utility\OmekaValue;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Api\Representation\SitePageRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\SitePageBlock;
use Omeka\Media\Renderer\RendererInterface;
use Omeka\Site\BlockLayout\AbstractBlockLayout;
use Omeka\Site\BlockLayout\BlockLayoutInterface;
use Omeka\Stdlib\ErrorStore;
use Zend\View\Renderer\PhpRenderer;

class PageBlockMediaAdapter extends AbstractBlockLayout implements BlockLayoutInterface
{

    /**
     * @var AbstractIngester
     */
    private $ingester;
    /**
     * @var RendererInterface
     */
    private $renderer;
    /**
     * @var LocaleHelper
     */
    private $localeHelper;

    public function __construct(
        AbstractIngester $ingester,
        MediaPageBlockDualRender $renderer,
        LocaleHelper $localeHelper
    ) {
        $this->ingester = $ingester;
        $this->renderer = $renderer;
        $this->localeHelper = $localeHelper;
    }

    /**
     * Get a human-readable label for the block layout.
     *
     * @return string
     */
    public function getLabel()
    {
        return $this->ingester->getLabel();
    }

    public function form(
        PhpRenderer $view,
        SiteRepresentation $site,
        SitePageRepresentation $page = null,
        SitePageBlockRepresentation $block = null
    ) {
        $elements = $this->ingester->getFormElements($block ? 'update' : 'create');

        if ($block) {
            $data = $this->ingester->parseFormData($block->data());
            foreach ($elements as $element) {
                $name = $element->getName();
                if (isset($data[$name])) {
                    $element->setValue($data[$name]);
                }
            }
        }

        return $this->ingester->renderFormElements(
            $view,
            $this->ingester->parseFormElements(
                $elements,
                'o:block[__blockIndex__][o:data]'
            )
        );
    }

    public function onHydrate(SitePageBlock $block, ErrorStore $errorStore)
    {
        $data = $block->getData();
        $this->ingester->prepareData($data, $errorStore);
        $block->setData($data);
    }

    public function render(PhpRenderer $view, SitePageBlockRepresentation $block)
    {
        $data = $block->data();

        // Locale check.
        $locale = $data['locale'] ?? null;
        $pageLocale = $this->getLang();
        if (
            $pageLocale &&
            $locale &&
            $locale !== 'default' &&
            OmekaValue::langMatches($locale, $pageLocale) === false
        ) {
            return '';
        }

        if ($this->renderer instanceof TranslatableRenderer) {
            $names = $this->renderer->getTranslatableFieldNames();
            /** @var \Zend\I18n\Translator\TranslatorInterface $translator */
            $translator = $block->getServiceLocator()->get('Zend\I18n\Translator\TranslatorInterface')->getDelegatedTranslator();

            foreach ($names as $key) {
                if (isset($data[$key]) && $data[$key]) {
                    $data[$key] = $translator->translate($data[$key], 'default:page_block');
                }
            }
        }


        return $this->renderer->renderFromData($view, $data ?? [], $this->renderer->pageBlockOptions($block));
    }

    private function getLang()
    {
        return $this->localeHelper->getLocale();
    }
}

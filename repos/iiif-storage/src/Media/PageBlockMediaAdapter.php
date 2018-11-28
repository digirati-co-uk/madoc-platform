<?php

namespace IIIFStorage\Media;

use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Api\Representation\SitePageRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\SitePageBlock;
use Omeka\Media\Renderer\RendererInterface;
use Omeka\Site\BlockLayout\AbstractBlockLayout;
use Omeka\Stdlib\ErrorStore;
use Zend\View\Renderer\PhpRenderer;

class PageBlockMediaAdapter extends AbstractBlockLayout
{

    /**
     * @var AbstractIngester
     */
    private $ingester;
    /**
     * @var RendererInterface
     */
    private $renderer;

    public function __construct(
        AbstractIngester $ingester,
        MediaPageBlockDualRender $renderer
    ) {
        $this->ingester = $ingester;
        $this->renderer = $renderer;
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
            $data = $block->data();
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

    public function render(PhpRenderer $view, SitePageBlockRepresentation $block)
    {
        return $this->renderer->renderFromData($view, $block->data(), $this->renderer->pageBlockOptions($block));
    }
}
<?php

namespace IIIFStorage\Media;

use Digirati\OmekaShared\Helper\LocaleHelper;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Renderer\PhpRenderer;

class HtmlRenderer implements RendererInterface, MediaPageBlockDualRender, TranslatableRenderer, LocalisedMedia
{
    use RenderMedia;

    /**
     * @var LocaleHelper
     */
    private $localeHelper;

    public function __construct(LocaleHelper $localeHelper)
    {
        $this->localeHelper = $localeHelper;
    }

    public function getLang(): string
    {
        return $this->localeHelper->getLocale();
    }

    public function renderFromData(PhpRenderer $view, array $data, array $options = [])
    {
        return $data['html'] ?? '';
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }

    public function getTranslatableFieldNames(): array
    {
        return ['html'];
    }
}

<?php


namespace IIIFStorage\Media;


use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Renderer\PhpRenderer;

interface MediaPageBlockDualRender extends RendererInterface
{
    public function renderFromData(PhpRenderer $view, array $data, array $options = []);

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array;
}

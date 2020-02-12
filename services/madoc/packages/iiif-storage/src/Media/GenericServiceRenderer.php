<?php

namespace IIIFStorage\Media;

use Digirati\OmekaShared\Framework\MediaPageBlockDualRender;
use Digirati\OmekaShared\Framework\RenderMedia;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Renderer\PhpRenderer;

class GenericServiceRenderer implements RendererInterface, MediaPageBlockDualRender
{
    use RenderMedia;

    public function renderFromData(PhpRenderer $view, array $data, array $options = [])
    {
        $label = $data['label'] ?? $data['profile'] ?? null;
        $url = isset($data['@id']) ? $data['@id'] : null;

        if (!$url) {
            // Not supported for now.
            return '';
        }
        if (!$label) {
            return '<a href="' . $url . '">'.$url.'</a>';
        }

        return '<a href="' . $url . '">'.$label.'</a>';
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}

<?php


namespace IIIFStorage\Media;

use Omeka\Media\Ingester\MutableIngesterInterface;
use Omeka\Form\Element;
use Zend\View\Renderer\PhpRenderer;

class BannerImageIngester extends AbstractIngester implements MutableIngesterInterface
{

    /**
     * Get a human-readable label for this ingester.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'Banner image';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'iiif-banner-image';
    }

    /**
     * @param string $operation either "create" or "update"
     * @return \Zend\Form\Element[]
     */
    public function getFormElements(string $operation): array
    {
        return [
            (new Element\Asset('banner_image'))
                ->setOptions([
                    'label' => 'Banner image',
                    'info' => 'Big image that spans the full page width'
                ])
        ];
    }
}

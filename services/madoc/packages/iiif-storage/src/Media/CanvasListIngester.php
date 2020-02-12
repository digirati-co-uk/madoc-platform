<?php


namespace IIIFStorage\Media;

use Digirati\OmekaShared\Framework\AbstractIngester;
use Omeka\Media\Ingester\IngesterInterface;
use Zend\Form\Element;

class CanvasListIngester extends AbstractIngester implements IngesterInterface
{

    /**
     * Get a human-readable label for this ingester.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'Canvas list';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'iiif-canvas-list';
    }

    /**
     * @param string $operation either "create" or "update"
     * @return Element[]
     */
    public function getFormElements(string $operation): array
    {
        return [
            (new Element\Text('search_query'))
                ->setOptions([
                    'label' => 'Search query',
                    'info' => 'Custom text to search for to find canvases to render'
                ]),
            // @todo re-implement.
//            (new Element\Checkbox('search_fallback'))
//                ->setOptions([
//                    'label' => 'Fallback to current resource',
//                    'info' => 'If the current resource is a canvas, this will populate other canvases from the manifest to fill empty spaces',
//                ])
//                ->setValue(true),
            (new Element\Number('search_results'))
                ->setOptions([
                    'label' => 'Number of results to render',
                    'info' => 'There is no maximum, but multiples of 4 work best.'
                ])
                ->setValue(0)
        ];
    }
}

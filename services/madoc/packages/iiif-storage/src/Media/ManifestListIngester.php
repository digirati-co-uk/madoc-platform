<?php

namespace IIIFStorage\Media;

use Digirati\OmekaShared\Framework\AbstractIngester;
use Omeka\Media\Ingester\IngesterInterface;
use Zend\Form\Element;

class ManifestListIngester extends AbstractIngester implements IngesterInterface
{

    /**
     * Get a human-readable label for this ingester.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'Manifest list';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'iiif-manifest-list';
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
                    'info' => 'Custom text to search for to find manifests to render'
                ]),
            // @todo re-enable
//            (new Element\Checkbox('search_fallback'))
//                ->setOptions([
//                    'label' => 'Fill remaining',
//                    'info' => 'If there is not enough search results, this will use any available manifests to fill the space.',
//                ])
//                ->setValue(true),
            (new Element\Number('search_results'))
                ->setOptions([
                    'label' => 'Number of render',
                    'info' => 'Number of search results to render, there is no maximum, but multiples of 4 work best.'
                ])
                ->setValue(0)
        ];
    }
}

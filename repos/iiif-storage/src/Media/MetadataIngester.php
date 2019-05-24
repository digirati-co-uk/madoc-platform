<?php

namespace IIIFStorage\Media;

use Digirati\OmekaShared\Framework\AbstractIngester;
use Omeka\Media\Ingester\IngesterInterface;
use Zend\Form\Element;
use Zend\Form\Element\Checkbox;

class MetadataIngester extends AbstractIngester implements IngesterInterface
{
    /**
     * Get a human-readable label for this ingester.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'IIIF Metadata';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'iiif-metadata';
    }

    /**
     * @param string $operation either "create" or "update"
     * @return Element[]
     */
    public function getFormElements(string $operation): array
    {
        return [
            (new Checkbox('show_title'))->setOptions([
                'label' => 'Show label',
                'info' => 'The label of the current resource',
            ]),
            (new Checkbox('show_summary'))->setOptions([
                'label' => 'Show summary',
                'info' => 'The summary or description of the current resource',
            ]),
            (new Checkbox('show_required'))->setOptions([
                'label' => 'Show required statement',
                'info' => 'The required statement or image credits of the current resource',
            ]),
            (new Checkbox('show_metadata_pairs'))->setOptions([
                'label' => 'Show metadata',
                'info' => 'Show metadata label value pairs of the current resource'
            ]),
        ];
    }
}

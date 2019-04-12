<?php

namespace IIIFStorage\Media;


use Omeka\Media\Ingester\IngesterInterface;
use Zend\Form\Element;

class LatestAnnotatedImagesIngester extends AbstractIngester implements IngesterInterface
{

    /**
     * @param string $operation either "create" or "update"
     * @return Element[]
     */
    public function getFormElements(string $operation): array
    {
        return [
            (new Element\Text('title'))
                ->setOptions([
                    'label' => 'Block title', // @translate
                    'info' => 'Title that will appear above block.', // @translate
                ]),
            (new Element\Number('number-of-images'))
                ->setOptions([
                    'label' => 'Number of images', // @translate
                    'info' => 'How many images should be shown.', // @translate
                ]),
            $this->getLocaleField(),
        ];
    }

    /**
     * Get a human-readable label for this ingester.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'Latest annotated images';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'latest-annotated-images';
    }
}

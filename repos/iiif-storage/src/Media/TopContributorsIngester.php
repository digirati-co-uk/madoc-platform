<?php

namespace IIIFStorage\Media;


use Omeka\Media\Ingester\IngesterInterface;
use Zend\Form\Element;

class TopContributorsIngester extends AbstractIngester implements IngesterInterface
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
            (new Element\Number('number-of-contributors'))
                ->setOptions([
                    'label' => 'Number of contributors', // @translate
                    'info' => 'How many contributors should be shown.', // @translate
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
        return 'Top contributors';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'top-contributors';
    }
}

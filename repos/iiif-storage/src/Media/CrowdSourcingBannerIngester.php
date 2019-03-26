<?php

namespace IIIFStorage\Media;

use Omeka\Api\Manager;
use Omeka\Form\Element\Asset;
use Omeka\Form\Element\HtmlTextarea;
use Omeka\Form\Element\ItemSetSelect;
use Omeka\Media\Ingester\IngesterInterface;
use Zend\Form\Element;
use Zend\View\Renderer\PhpRenderer;

class CrowdSourcingBannerIngester extends AbstractIngester implements IngesterInterface
{
    /**
     * @var Manager
     */
    private $api;

    public function __construct(Manager $api)
    {
        $this->api = $api;
    }

    /**
     * @param string $operation either "create" or "update"
     * @return Element[]
     */
    public function getFormElements(string $operation): array
    {
        $itemSelect = (new ItemSetSelect('collection'));

        $itemSelect->setApiManager($this->api);

        return [
            (new Element\Text('title'))
                ->setOptions([
                    'label' => 'Block title', // @translate
                    'info' => 'Title that will appear above block.', // @translate
                ]),
            (new HtmlTextarea('text'))
                ->setOptions([
                    'label' => 'Text', // @translate
                    'info' => 'Copy that will appear under title', // @translate
                ]),
            (new Element\Text('subtitle'))
                ->setOptions([
                    'label' => 'Subtitle',
                    'info' => 'Appears under the main mast head',
                ]),
            (new HtmlTextarea('subtext'))
                ->setOptions([
                    'label' => 'Subtext',
                    'info' => 'Appears under the subtitle, below the main masthead '
                ]),
            (new Asset('background'))
                ->setOptions([
                    'label' => 'Background image', // @translate
                    'info' => 'The image shown on the masthead', // @translate
                ]),
            (new Element\Checkbox('show_button'))
                ->setOptions([
                    'label' => 'Show link to collection',
                    'info' => 'Check this if you want a call to action, configure it below',
                ]),
            (new Element\Text('button_text'))
                ->setOptions([
                    'label' => 'Button text',
                    'info' => 'Label for button'
                ]),
            (new Element\Text())
                ->setOptions([
                    'label' => 'Collection ID', // @translate
                    'info' => 'ID Main collection used in call to action, defaults to all collections in site (/collections/all)', // @translate
                ]),
        ];
    }

    /**
     * Get a human-readable label for this ingester.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'Crowd sourcing banner';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'crowd-sourcing-banner';
    }
}

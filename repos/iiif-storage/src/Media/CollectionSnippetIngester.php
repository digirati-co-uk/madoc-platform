<?php

namespace IIIFStorage\Media;

use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Form\Element\ResourceSelect;
use Omeka\Media\Ingester\IngesterInterface;
use Zend\Form\Element;
use Zend\View\Renderer\PhpRenderer;

class CollectionSnippetIngester extends AbstractIngester implements IngesterInterface
{

    /**
     * @var Manager
     */
    private $api;
    /**
     * @var PropertyIdSaturator
     */
    private $saturator;

    public function __construct(
        Manager $api,
        PropertyIdSaturator $saturator
    ) {
        $this->api = $api;
        $this->saturator = $saturator;
    }

    /**
     * Get a human-readable label for this ingester.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'Collection snippet';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'iiif-collection-snippet';
    }

    public function renderFormElements(PhpRenderer $view, array $formElements)
    {
        $elements = parent::renderFormElements($view, $formElements);
        return implode('', [
            $elements,
            '<script>$("body").on(\'click [data-media-type="iiif-collection-snippet"]\', function () { $("#collection-select").chosen(chosenOptions); });</script>',
        ]);
    }

    /**
     * @param string $operation either "create" or "update"
     * @return Element[]
     */
    public function getFormElements(string $operation): array
    {
        $collection = new ResourceSelect('collection');
        $collection->setApiManager($this->api);
        $collection->setAttributes([
            'required' => false,
            'id' => 'collection-select',
            'class' => 'chosen-select',
            'data-placeholder' => 'Select a collection', // @translate
            'data-api-base-url' => '/api/items',
        ]);
        $collection->setOptions([
            'label' => 'Choose collection', // @translate
            'info' => 'Choose a collection to be displayed.', // @translate
            'empty_option' => '',
            'resource_value_options' => [
                'resource' => 'item_sets',
                'query' => [
                    'resource_class_id' => $this->saturator->getResourceClassByTerm('sc:Collection')->id(),
                ],
                'option_text_callback' => function ($item) {
                    /** @var ItemRepresentation $item */
                    return $item->displayTitle();
                },
            ],
        ]);

        return [
            $collection,
            (new Element\Number('manifestsToShow'))
                ->setOptions([
                    'label' => 'Thumbnails to show',
                    'info' => 'How many manifests should be shown from the collection',
                ])
        ];
    }
}

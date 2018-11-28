<?php

namespace IIIFStorage\ViewFilters;

use Omeka\Api\Representation\ResourceClassRepresentation;
use Zend\View\Model\ModelInterface;
use Zend\View\Renderer\PhpRenderer;

class DisableJsonField implements ViewFilterInterface
{

    const CSS_SNIPPET = <<<CSS
    [data-property-term="dcterms:source"], 
    [data-property-term="dcterms:identifier"] .add-values, 
    [data-property-term="dcterms:identifier"] .remove-value {
        opacity: 0.4; 
        pointer-events: none;
    }
CSS;

    public function __invoke(PhpRenderer $renderer, ModelInterface $vm)
    {
        $itemSet = $vm->getVariable('itemSet');

        if (!$itemSet) {
            $itemSet = $vm->getVariable('item');
        }

        if (!$itemSet) {
            return;
        }

        /** @var ResourceClassRepresentation $resourceClass */
        $resourceClass = $itemSet->resourceClass();
        if (!$resourceClass) {
            return;
        }

        $itemSetLabel = $resourceClass->label();
        if ($itemSetLabel === 'Manifest' || $itemSetLabel === 'Collection') {
            $renderer->headStyle()->appendStyle(static::CSS_SNIPPET);
        }
    }

    public function getEvent(): string
    {
        return 'view.edit.before';
    }

    public function getEntity(): array
    {
        return ['Omeka\Controller\Admin\ItemSet', 'Omeka\Controller\Admin\Item'];
    }
}

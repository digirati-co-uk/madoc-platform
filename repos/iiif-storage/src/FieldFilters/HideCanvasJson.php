<?php

namespace IIIFStorage\FieldFilters;

use Omeka\Api\Representation\AbstractResourceEntityRepresentation;
use Omeka\Api\Representation\ItemRepresentation;

class HideCanvasJson implements FieldFilterInterface
{

    public function __invoke(AbstractResourceEntityRepresentation $itemSet, array $data): ?array
    {
        $resourceTemplate = $itemSet->resourceTemplate();
        if ($resourceTemplate && (
                $resourceTemplate->label() === 'IIIF Manifest' || $resourceTemplate->label() === 'IIIF Canvas'
            )
        ) {
            if ($data['dcterms:source']) {
                unset($data['dcterms:source']);
            }
        }
        return $data;
    }

    public function getEntity(): string
    {
        return ItemRepresentation::class;
    }
}

<?php

namespace IIIFStorage\FieldFilters;

use Omeka\Api\Representation\AbstractResourceEntityRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;

class HideManifestCollectionJson implements FieldFilterInterface
{

    public function __invoke(AbstractResourceEntityRepresentation $itemSet, array $data): ?array
    {
        $resourceTemplate = $itemSet->resourceTemplate();
        if ($resourceTemplate && $resourceTemplate->label() === 'IIIF Collection') {
            if (isset($data['dcterms:source'])) {
                unset($data['dcterms:source']);
            }
        }
        return $data;
    }

    public function getEntity(): string
    {
        return ItemSetRepresentation::class;
    }
}

<?php

namespace i18n\Resource;

use Omeka\Api\Representation\ItemSetRepresentation;

class TranslatableItemSetResource extends AbstractTranslatableItemResource
{
    public function __construct(ItemSetRepresentation $item)
    {
        parent::__construct($item, 'omeka-item-sets', 'item-set');
    }
}

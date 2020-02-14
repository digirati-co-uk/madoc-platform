<?php

namespace i18n\Resource;

use Omeka\Api\Representation\ItemRepresentation;

class TranslatableItemResource extends AbstractTranslatableItemResource
{
    public function __construct(ItemRepresentation $item)
    {
        parent::__construct($item, 'omeka-items', 'item');
    }
}

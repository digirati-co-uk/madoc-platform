<?php

namespace i18n\Resource;

use Omeka\Api\Representation\AbstractResourceEntityRepresentation;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;

/**
 * A {@link TranslatableResource} that represents a single {@link Item} from Omeka, whether it's an Item, ItemSet,
 * or other.
 */
abstract class AbstractTranslatableItemResource implements TranslatableResource
{
    /**
     * @var ItemRepresentation
     */
    private $item;

    /**
     * @var string
     */
    private $type;

    /**
     * @var string
     */
    private $project;

    public function __construct(AbstractResourceEntityRepresentation $item, string $project, string $resourceType)
    {
        $this->item = $item;
        $this->project = $project;
        $this->type = $resourceType;
    }

    public function getMessages()
    {
        $label = $this->item->value(
            'rdfs:label',
            [
                'default' => $this->item->displayTitle(),
            ]
        );

        if (!is_string($label)) {
            $label = (string) $label;
        }

        yield $label => $label;

        $description = $this->item->value(
            'dcterms:description',
            [
                'default' => null,
            ]
        );

        if (null !== $description) {
            yield $description => $description;
        }
    }

    /**
     * Get the unique name of this resource.
     *
     * @return TranslatableResourceIdentifier
     */
    public function getIdentifier()
    {
        return TranslatableResourceIdentifier::forResource($this->type, $this->item->displayTitle($this->item->id()))
            ->setProject($this->project);
    }

    /**
     * Create an instance of a {@link AbstractTranslatableItemResource} given an Item resource.
     *
     * @param AbstractResourceEntityRepresentation $resource
     *
     * @return TranslatableItemResource|TranslatableItemSetResource
     */
    public static function from(AbstractResourceEntityRepresentation $resource)
    {
        if ($resource instanceof ItemSetRepresentation) {
            return new TranslatableItemSetResource($resource);
        } elseif ($resource instanceof ItemRepresentation) {
            return new TranslatableItemResource($resource);
        } else {
            throw new \InvalidArgumentException('Invalid resource object, not an item');
        }
    }
}

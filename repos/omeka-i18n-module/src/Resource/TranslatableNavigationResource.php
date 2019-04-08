<?php

namespace i18n\Resource;

use Omeka\Api\Representation\SiteRepresentation;

class TranslatableNavigationResource implements TranslatableResource
{
    /**
     * @var SiteRepresentation
     */
    private $site;

    public function __construct(SiteRepresentation $siteRepresentation)
    {
        $this->site = $siteRepresentation;
    }

    /**
     * Get a dictionary mapping translation keys to messages for the given {@code languageCode}.
     *
     * @return \Generator
     */
    public function getMessages()
    {
        $navigationItems = $this->site->navigation();
        $remainingItems = $navigationItems;

        while (count($remainingItems) > 0) {
            $item = array_pop($remainingItems);
            $itemLinks = $item['links'];

            foreach ($itemLinks as $item) {
                array_push($remainingItems, $item);
            }

            $label = $item['data']['label'];
            if (empty($label)) {
                continue;
            }

            yield $label => $label;
        }
    }

    /**
     * Get the unique name of this resource.
     *
     * @return TranslatableResourceIdentifier
     */
    public function getIdentifier()
    {
        return TranslatableResourceIdentifier::forResource('navigation')->setProject($this->site->slug());
    }
}

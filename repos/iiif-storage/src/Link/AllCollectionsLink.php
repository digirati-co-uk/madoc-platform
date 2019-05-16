<?php

namespace IIIFStorage\Link;

use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Site\Navigation\Link\LinkInterface;
use Omeka\Stdlib\ErrorStore;

class AllCollectionsLink implements LinkInterface
{

    /**
     * Get the link type name.
     *
     * @return string
     */
    public function getName()
    {
        return 'All Collections';
    }

    /**
     * Get the view template used to render the link form.
     *
     * @return string
     */
    public function getFormTemplate()
    {
        return 'iiif-storage/link/all-collections';
    }

    /**
     * Validate link data.
     *
     * @param array $data
     * @return bool
     */
    public function isValid(array $data, ErrorStore $errorStore)
    {
        return true;
    }

    /**
     * Get the link label.
     *
     * @param array $data
     * @param SiteRepresentation $site
     * @return array
     */
    public function getLabel(array $data, SiteRepresentation $site)
    {
        return isset($data['label']) && '' !== trim($data['label'])
            ? $data['label'] : null;
    }

    /**
     * Translate from site navigation data to Zend Navigation configuration.
     *
     * @param array $data
     * @param SiteRepresentation $site
     * @return array
     */
    public function toZend(array $data, SiteRepresentation $site)
    {
        return [
            'route' => 'site/iiif-collection/all',
            'params' => [
                'site-slug' => $site->slug(),
            ],
        ];
    }

    /**
     * Translate from site navigation data to jsTree configuration.
     *
     * @param array $data
     * @param SiteRepresentation $site
     * @return array
     */
    public function toJstree(array $data, SiteRepresentation $site)
    {
        return [
            'label' => $data['label'] ?? '',
        ];
    }
}

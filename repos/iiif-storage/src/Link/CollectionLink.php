<?php

namespace IIIFStorage\Link;

use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Site\Navigation\Link\LinkInterface;
use Omeka\Stdlib\ErrorStore;

class CollectionLink implements LinkInterface
{

    public function getName()
    {
        return 'Collection';
    }

    public function getFormTemplate()
    {
        return 'iiif-storage/link/collection';
    }

    public function isValid(array $data, ErrorStore $errorStore)
    {
        return true;
    }

    public function getLabel(array $data, SiteRepresentation $site)
    {
        return $data['label'] ?? '';
    }

    public function toZend(array $data, SiteRepresentation $site)
    {
        return [
            'route' => 'site/iiif-collection/view',
            'params' => [
                'site-slug' => $site->slug(),
                'collection' => $data['id'],
            ],
        ];
    }

    public function toJstree(array $data, SiteRepresentation $site)
    {
        return [
            'label' => $data['label'] ?? '',
            'id' => $data['id'] ?? '',
        ];
    }
}

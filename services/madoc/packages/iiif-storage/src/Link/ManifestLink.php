<?php

namespace IIIFStorage\Link;

use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Site\Navigation\Link\LinkInterface;
use Omeka\Stdlib\ErrorStore;

class ManifestLink implements LinkInterface
{

    public function getName()
    {
        return 'Manifest';
    }

    public function getFormTemplate()
    {
        return 'iiif-storage/link/manifest';
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
            'route' => 'site/iiif-manifest/view',
            'params' => [
                'site-slug' => $site->slug(),
                'manifest' => $data['id'],
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

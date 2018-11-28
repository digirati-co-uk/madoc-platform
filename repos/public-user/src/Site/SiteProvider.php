<?php

namespace PublicUser\Site;

use Omeka\Api\Representation\SiteRepresentation;

class SiteProvider
{
    private $site;

    public function setSite(SiteRepresentation $site)
    {
        $this->site = $site;
    }

    /**
     * @return SiteRepresentation
     */
    public function get()
    {
        return $this->site;
    }
}

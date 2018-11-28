<?php

namespace ElucidateModule\Controller;

use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Mvc\Controller\Plugin\Api;
use Zend\Http\Request;
use Zend\Mvc\Controller\AbstractActionController;

class TypedActionController extends AbstractActionController
{
    public function getCurrentSite(): SiteRepresentation
    {
        return $this->currentSite();
    }

    public function getApi(): Api
    {
        return $this->api();
    }

    public function getCurrentRequest(): Request
    {
        return $this->getRequest();
    }
}

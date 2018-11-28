<?php

namespace Digirati\OmekaShared\Framework;

use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Api\Representation\UserRepresentation;
use Zend\Diactoros\Response;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Mvc\MvcEvent;
use Zend\Psr7Bridge\Psr7Response;

/**
 * @method SiteRepresentation currentSite()
 * @method setBrowseDefaults(string $created)
 * @method UserRepresentation identity()
 */
class AbstractPsr7ActionController extends AbstractActionController
{
    private $corsEnabled = false;

    protected function allowCors()
    {
        $this->corsEnabled = true;
    }

    public function onDispatch(MvcEvent $e)
    {
        $result = parent::onDispatch($e);
        if ($result instanceof Response) {
            $result = Psr7Response::toZend($result);
        }

        if ($this->corsEnabled) {
            $headers = $result->getHeaders();
            $headers->addHeaderLine('Access-Control-Allow-Origin: *');
            $headers->addHeaderLine('Access-Control-Allow-Methods: PUT, GET, POST, PATCH, DELETE, OPTIONS');
            $headers->addHeaderLine('Access-Control-Allow-Headers: Authorization, Origin, X-Requested-With, Content-Type, Accept');
        }

        return $result;
    }
}
<?php

namespace MadocBridge\Controller;

use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use Zend\Http\Headers;
use Zend\Http\Request;
use Zend\Http\Response;
use Zend\Http\Response as ZendResponse;
use Zend\Mvc\MvcEvent;
use Zend\Psr7Bridge\Psr7Response;
use Zend\View\Model\ViewModel;

class TemplateController extends AbstractPsr7ActionController
{
    public function viewAction()
    {

        $user = $this->getCurrentUser();
        return new ViewModel();
    }

    public function onDispatch(MvcEvent $e)
    {
        $result = parent::onDispatch($e);

        $response = $e->getResponse();
        if ($this->getCurrentUser()) {
            $headers = $response->getHeaders();
            /** @var Request $req */
            $req = $e->getRequest();
            $reqHeaders = $req->getHeaders()->toArray() ?? [];
            $headers->addHeaderLine('X-Authenticated-User-Id', $this->getCurrentUser()->getId());
        }
        return $result;
    }
}

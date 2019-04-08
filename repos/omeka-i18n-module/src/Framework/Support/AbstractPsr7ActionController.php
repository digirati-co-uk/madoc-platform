<?php

namespace i18n\Framework\Support;

use Zend\Diactoros;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Mvc\MvcEvent;
use Zend\Psr7Bridge\Psr7Response;

abstract class AbstractPsr7ActionController extends AbstractActionController
{
    public function onDispatch(MvcEvent $e)
    {
        $result = parent::onDispatch($e);
        if ($result instanceof Diactoros\Response) {
            $result = Psr7Response::toZend($result);
        }

        return $result;
    }
}

<?php

namespace Digirati\OmekaShared\Factory;

use Digirati\OmekaShared\Helper\UrlHelper;
use Interop\Container\ContainerInterface;
use Zend\Http\Request;
use Zend\Router\Http\TreeRouteStack;
use Zend\View\Helper\Url;

class UrlHelperFactory
{
    public function __invoke(ContainerInterface $c) {
        return new UrlHelper(function () use ($c) {
            /** @var Url $url */
            $url = $c->get('ViewHelperManager')->get('Url');
            /** @var TreeRouteStack $router */
            $router = $c->get('Router');
            /** @var Request $request */
            $request = $c->get('Request');
            $router->setRequestUri($request->getUri());
            $url->setRouter($router);

            return $url;
        });
    }
}

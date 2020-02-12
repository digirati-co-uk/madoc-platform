<?php


namespace Digirati\OmekaShared\Helper;


use Zend\Http\Request;
use Zend\Router\Http\RouteMatch;
use Zend\Router\Http\TreeRouteStack;
use Zend\Uri\Uri;

class RouteMatchHelper
{
    /**
     * @var TreeRouteStack
     */
    private $routeStack;

    public function __construct(TreeRouteStack $routeStack)
    {
        $this->routeStack = $routeStack;
    }

    /**
     * @param string $url
     * @param string|null $baseUrl
     * @return RouteMatch|null
     */
    public function match(string $url, string $baseUrl = null)
    {
        return static::matchFrom($this->routeStack, $url, $baseUrl);
    }

    /**
     * @param TreeRouteStack $routeStack
     * @param string $url
     * @param string|null $baseUrl
     * @return RouteMatch|null
     */
    public static function matchFrom(TreeRouteStack $routeStack, string $url, string $baseUrl = null)
    {
        $refererRequest = new Request();
        $refererRequest->setUri($url);
        if ($baseUrl) {
            $urlBase = clone $refererRequest->getUri();
            $urlBase->setPath(null);
            $urlBase->setQuery(null);
            $urlBase->setFragment(null);
            $baseUrlObj = new Uri($baseUrl);
            $baseUrlObj->setPath(null);
            if ($urlBase->toString() !== $baseUrlObj->toString()) {
                return null;
            }
        }
        $match = $routeStack->match($refererRequest);

        if ($match instanceof RouteMatch) {
            return $match;
        }
        return null;
    }

}

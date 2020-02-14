<?php

namespace PublicUser\Acl;

use Zend\Http\Request;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Assertion\AssertionInterface;
use Zend\Permissions\Acl\Resource\ResourceInterface;
use Zend\Permissions\Acl\Role\RoleInterface;
use Zend\Router\RouteInterface;

class IsOnRouteAssertion implements AssertionInterface
{
    /**
     * @var RouteInterface
     */
    private $routeMatcher;

    /**
     * @var Request
     */
    private $request;

    /**
     * @var string[]|array
     */
    private $routes;

    public function __construct(RouteInterface $routeMatcher, Request $request, array $publicuserRoutes)
    {
        $this->routeMatcher = $routeMatcher;
        $this->request = $request;
        $this->routes = $publicuserRoutes;
    }

    public function assert(Acl $acl, RoleInterface $role = null, ResourceInterface $resource = null, $privilege = null)
    {
        $currentRoute = $this->routeMatcher->match($this->request);
        $currentRouteName = $currentRoute->getMatchedRouteName();

        return null !== $currentRoute && in_array($currentRouteName, $this->routes, true);
    }
}

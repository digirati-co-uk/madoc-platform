<?php

namespace PublicUser\Site;

use PublicUser\Acl\ResourcePermissionDeniedException;
use Omeka\Api\Exception\PermissionDeniedException;
use Omeka\Entity\Site;
use Zend\EventManager\EventManagerInterface;
use Zend\EventManager\ListenerAggregateInterface;
use Zend\Http\Response;
use Zend\Mvc\Application;
use Zend\Mvc\MvcEvent;

class SiteListeners implements ListenerAggregateInterface
{
    /**
     * @var SiteProvider
     */
    private $siteProvider;

    public function __construct(SiteProvider $siteProvider)
    {
        $this->siteProvider = $siteProvider;
    }

    public function handleSiteEntry(MvcEvent $event)
    {
        $services = $event->getApplication()->getServiceManager();
        $siteSlug = $event->getRouteMatch()->getParam('site-slug');

        if (null === $siteSlug) {
            return true;
        }

        $apiManager = $services->get('Omeka\ApiManager');
        $site = $apiManager->read('sites', ['slug' => $siteSlug])->getContent();
        $this->siteProvider->setSite($site);

        return true;
    }

    public function handlePermissionsError(MvcEvent $event)
    {
        // Would be nicer if Omeka returned us the resource that
        // access was denied for. Until then look at the exception message,
        // and decide if this is a permissions denied exception for an
        // Omeka\Entity\Site resource.

        $exception = $event->getParam('exception');
        if (!$exception instanceof PermissionDeniedException) {
            return true;
        }

        if (strstr($exception->getMessage(), Site::class)) {
            $eventManager = $event->getApplication()->getEventManager();
            $newEvent = clone $event;
            $newEvent->setError(Application::ERROR_EXCEPTION);
            $newEvent->setParam('exception', new ResourcePermissionDeniedException(Site::class));
            $newEvent->setName(MvcEvent::EVENT_DISPATCH_ERROR);

            return false === $eventManager->triggerEvent($newEvent)->stopped();
        }

        return true;
    }

    public function handleSitePermissionsError(MvcEvent $event)
    {
        $exception = $event->getParam('exception');
        if (!$exception instanceof ResourcePermissionDeniedException) {
            return true;
        }

        $currentRoute = $event->getRouteMatch();
        if (null === $currentRoute) {
            return false;
        }

        $currentRouteName = $currentRoute->getMatchedRouteName();
        $resource = $exception->getResource();

        if (Site::class === $resource && 'site/publicuser-login' !== $currentRouteName) {
            $newRoute = $event->getRouter()->assemble(
                $currentRoute->getParams(),
                ['name' => 'site/publicuser-login']
            );

            $redirect = new Response();
            $redirect->setStatusCode(302);
            $redirect->getHeaders()->addHeaderLine('Location', $newRoute);
            $event->setResponse($redirect);
            $event->stopPropagation(true);

            return false;
        }

        return true;
    }

    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $events->attach(MvcEvent::EVENT_ROUTE, [
            $this, 'handleSiteEntry',
        ]);

        $events->attach(MvcEvent::EVENT_DISPATCH_ERROR, [
            $this, 'handlePermissionsError',
        ], 1);

        $events->attach(MvcEvent::EVENT_DISPATCH_ERROR, [
            $this, 'handleSitePermissionsError',
        ], 2);
    }

    public function detach(EventManagerInterface $events)
    {
        $events->detach([$this, 'handleSitePermissionsError']);
        $events->detach([$this, 'handlePermissionsError']);
        $events->detach([$this, 'handleSiteEntry']);
    }
}

<?php

namespace AutoComplete;

use Omeka\Api\Adapter\ItemAdapter;
use Omeka\Module\AbstractModule;
use AutoComplete\Api\OmekaResourceClassQueryListener;
use AutoComplete\Controller\CompletionController;
use Zend\Config\Factory;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Mvc\MvcEvent;

class Module extends AbstractModule
{
    public function attachListeners(SharedEventManagerInterface $sharedEventManager)
    {
        $resourceQueryListener = $this->getServiceLocator()->get(OmekaResourceClassQueryListener::class);
        $sharedEventManager->attach(ItemAdapter::class, 'api.search.query', $resourceQueryListener);
    }

    public function getConfig()
    {
        return Factory::fromFiles(glob(__DIR__ . '/config/*.config.*'));
    }

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(null, CompletionController::class);

        if ($event->getControllerClass() === CompletionController::class) {
            $headers = $event->getResponse()->getHeaders();
            $headers->addHeaderLine('Access-Control-Allow-Origin: *');
            $headers->addHeaderLine('Access-Control-Allow-Methods: PUT, GET, POST, PATCH, DELETE, OPTIONS');
            $headers->addHeaderLine('Access-Control-Allow-Headers: Authorization, Origin, X-Requested-With, Content-Type, Accept');
        }
    }
}

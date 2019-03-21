<?php

namespace ElucidateProxy;

use Digirati\OmekaShared\ModuleExtensions\ConfigurationFormAutoloader;
use ElucidateProxy\Controller\AnnotationController;
use ElucidateProxy\Controller\ContainerController;
use ElucidateProxy\Controller\ElucidateProxyController;
use ElucidateProxy\Subscriber\ElucidateErrorSubscriber;
use ElucidateProxy\Subscriber\ElucidateProxyUrlSubscriber;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Acl;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Zend\Config\Factory;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Mvc\MvcEvent;
use Zend\View\Helper\ServerUrl;

class Module extends AbstractModule
{

    private $config;

    public function loadVendor()
    {
        if (file_exists(__DIR__.'/build/vendor-dist/autoload.php')) {
            require_once __DIR__.'/build/vendor-dist/autoload.php';
        } elseif (file_exists(__DIR__.'/vendor/autoload.php')) {
            require_once __DIR__.'/vendor/autoload.php';
        }
    }

    public function getConfig()
    {
        if ($this->config) {
            return $this->config;
        }
        // Load our composer dependencies.
        $this->loadVendor();
        // Load our configuration.
        $this->config = Factory::fromFiles(
            glob(__DIR__.'/config/*.config.*')
        );

        return $this->config;
    }

    public function getServerUrl()
    {
        return (new ServerUrl())->__invoke(false);
    }

    public function attachListeners(SharedEventManagerInterface $em)
    {
        $container = $this->getServiceLocator();
        /** @var EventDispatcher $ev */
        $eventDispatcher = $container->get(EventDispatcher::class);

        $eventDispatcher->addSubscriber(new ElucidateProxyUrlSubscriber($this->getServerUrl()));
    }

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        $application = $event->getApplication();
        $services = $application->getServiceManager();
        $em = $application->getEventManager();
        //handle the dispatch error (exception)
        $em->attach(MvcEvent::EVENT_DISPATCH_ERROR, $services->get(ElucidateErrorSubscriber::class), -6000);

        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            [
                AnnotationController::class,
                ContainerController::class,
                ElucidateProxyController::class,
            ]
        );
    }
}

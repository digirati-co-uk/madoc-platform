<?php

namespace GoogleAnalytics;

use Digirati\OmekaShared\ModuleExtensions\ConfigurationFormAutoloader;
use GoogleAnalytics\Admin\ConfigurationForm;
use GoogleAnalytics\Events\GoogleScriptTagEventListener;
use Omeka\Module\AbstractModule;
use Zend\Config\Factory;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\View\View;
use Zend\View\ViewEvent;

class Module extends AbstractModule
{
    use ConfigurationFormAutoloader;

    private $config;

    public function getConfig()
    {
        if (null !== $this->config) {
            return $this->config;
        }

        $this->config = Factory::fromFiles(
            glob(__DIR__.'/config/*.config.*')
        );

        return $this->config;
    }

    function getConfigFormClass(): string
    {
        return ConfigurationForm::class;
    }

    public function attachListeners(SharedEventManagerInterface $eventManager)
    {
        $subscriber = $this->getServiceLocator()->get(GoogleScriptTagEventListener::class);
        $eventManager->attach(View::class, ViewEvent::EVENT_RENDERER_POST, $subscriber);
    }
}

<?php

namespace MadocSearch;

use Digirati\OmekaShared\ModuleExtensions\ConfigurationFormAutoloader;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Acl;
use MadocSearch\Admin\ConfigurationForm;
use Zend\Config\Factory;
use Zend\ModuleManager\Feature\ConfigProviderInterface;
use Zend\Mvc\MvcEvent;

class Module extends AbstractModule implements ConfigProviderInterface
{
    use ConfigurationFormAutoloader;

    private $config;

    public function getConfig()
    {
        if ($this->config) {
            return $this->config;
        }

        // Load our configuration.
        $this->config = Factory::fromFiles(
            glob(__DIR__ . '/config/*.config.*')
        );

        return $this->config;
    }

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            []
        );
    }

    function getConfigFormClass(): string
    {
        return ConfigurationForm::class;
    }
}

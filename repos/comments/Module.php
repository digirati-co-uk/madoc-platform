<?php

namespace Comments;

use Omeka\Module\AbstractModule;
use Zend\Config\Factory;

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
}

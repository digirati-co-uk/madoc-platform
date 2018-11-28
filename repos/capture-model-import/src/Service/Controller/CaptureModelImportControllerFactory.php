<?php

namespace CaptureModelImport\Service\Controller;

use CaptureModelImport\Controller\CaptureModelImportController;
use Interop\Container\ContainerInterface;
use Zend\ServiceManager\Factory\FactoryInterface;

class CaptureModelImportControllerFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $serviceLocator, $requestedName, array $options = null)
    {
        $config = $serviceLocator->get('Config');
        $api = $serviceLocator->get('Omeka\ApiManager');
        $logger = $serviceLocator->get('Omeka\Logger');

        return new CaptureModelImportController(
           $api, $logger, $config
        );
    }
}

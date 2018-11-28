<?php

namespace PublicUser\Extension;

use LogicException;
use PublicUser\Settings\PublicUserSettings;
use Zend\Mail\Transport\Factory as TransportFactory;
use Zend\ServiceManager\Factory\FactoryInterface;
use Interop\Container\ContainerInterface;

class ConfigurableMailerFactory implements FactoryInterface
{
    /**
     * Create the mailer service.
     *
     * @param ContainerInterface $serviceLocator
     * @param $requestedName
     * @param array|null $options
     *
     * @return ConfigurableMailer
     *
     * @throws \Psr\Container\ContainerExceptionInterface
     * @throws \Psr\Container\NotFoundExceptionInterface
     */
    public function __invoke(ContainerInterface $serviceLocator, $requestedName, array $options = null)
    {
        $config = $serviceLocator->get('Config');
        $viewHelpers = $serviceLocator->get('ViewHelperManager');
        $entityManager = $serviceLocator->get('Omeka\EntityManager');
        if (!isset($config['mail']['transport'])) {
            throw new LogicException('Missing mail transport configuration');
        }
        $transport = TransportFactory::create($config['mail']['transport']);
        $defaultOptions = [];
        if (isset($config['mail']['default_message_options'])) {
            $defaultOptions = $config['mail']['default_message_options'];
        }
        if (!isset($defaultOptions['administrator_email'])) {
            $settings = $serviceLocator->get('Omeka\Settings');
            $defaultOptions['from'] = $settings->get('administrator_email');
        }

        return new ConfigurableMailer($transport, $viewHelpers, $entityManager, $defaultOptions, $serviceLocator->get(PublicUserSettings::class));
    }
}

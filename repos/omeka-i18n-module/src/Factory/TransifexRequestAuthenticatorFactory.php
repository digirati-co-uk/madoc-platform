<?php

namespace i18n\Factory;

use i18n\Security\TransifexRequestAuthenticator;
use Interop\Container\ContainerInterface;
use Zend\ServiceManager\Exception\ServiceNotCreatedException;
use Zend\ServiceManager\Factory\FactoryInterface;

class TransifexRequestAuthenticatorFactory implements FactoryInterface
{
    /**
     * Create an object.
     *
     * {@inheritdoc}
     */
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        $config = $container->get('Config');

        if (!isset($config['transifex']) || !isset($config['transifex']['secret_key'])
            || empty($config['transifex']['secret_key'])) {
            throw new ServiceNotCreatedException("No 'transifex.apikey' config key defined");
        }

        return new TransifexRequestAuthenticator($config['transifex']['secret_key']);
    }
}

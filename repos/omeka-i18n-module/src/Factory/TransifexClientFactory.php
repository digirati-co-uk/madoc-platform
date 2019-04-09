<?php

namespace i18n\Factory;

use BabDev\Transifex\Transifex;
use Interop\Container\ContainerInterface;
use Zend\ServiceManager\Exception\ServiceNotCreatedException;
use Zend\ServiceManager\Factory\FactoryInterface;

class TransifexClientFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        $client = $container->has('i18n.guzzle.client') ? $container->get('i18n.guzzle.client') : null;
        $config = $container->get('Config');

        if (!isset($config['transifex']) || !isset($config['transifex']['apikey'])
            || empty($config['transifex']['apikey'])) {
            throw new ServiceNotCreatedException("No 'transifex.apikey' config key defined");
        }

        return new Transifex(
            [
                'api.username' => 'api',
                'api.password' => $config['transifex']['apikey'],
            ],
            $client
        );
    }
}

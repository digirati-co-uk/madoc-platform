<?php

namespace i18n\Factory;

use BabDev\Transifex\TransifexObject;
use Interop\Container\ContainerInterface;
use Zend\ServiceManager\Exception\ServiceNotCreatedException;
use Zend\ServiceManager\Factory\FactoryInterface;

class TransifexObjectFactory implements FactoryInterface
{
    /**
     * Instantiate a new {@link TransifexObject} given by the second part of {@code requestedName} in a format like:
     * <pre>
     *  transifex.projects
     *  transifex.resources
     *  transifex.translations
     * </pre>.
     *
     * @return TransifexObject
     */
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        list(, $name) = explode('.', $requestedName);

        if (!$container->has('transifex')) {
            throw new ServiceNotCreatedException('Unable to find transifex client for service factory');
        }

        return $container->get('transifex')->get($name);
    }
}

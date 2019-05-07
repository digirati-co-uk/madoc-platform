<?php

namespace i18n\Translator;

use i18n\Loader\MadocMessageLoader;
use i18n\Loader\TransifexThemeMessageLoader;
use i18n\Module as I18nModule;
use Interop\Container\ContainerInterface;
use Interop\Container\Exception\ContainerException;
use Zend\I18n\Translator\LoaderPluginManager;
use Zend\I18n\Translator\Translator;
use Zend\ServiceManager\Exception\ServiceNotCreatedException;
use Zend\ServiceManager\Exception\ServiceNotFoundException;
use Zend\ServiceManager\Factory\DelegatorFactoryInterface;

class DelegateTranslatorFactory implements DelegatorFactoryInterface
{
    /**
     * A factory that creates delegates of a given service.
     *
     * @param ContainerInterface $container
     * @param string             $name
     * @param callable           $callback
     * @param null|array         $options
     *
     * @return object
     *
     * @throws ServiceNotFoundException   if unable to resolve the service
     * @throws ServiceNotCreatedException if an exception is raised when
     *                                    creating a service
     * @throws ContainerException         if any other error occurs
     */
    public function __invoke(ContainerInterface $container, $name, callable $callback, array $options = null)
    {
        $translator = $callback();
        /** @var Translator $delegate */
        $delegate = $translator->getDelegatedTranslator();
        $pluginManager = new LoaderPluginManager($container);
        $delegate->setPluginManager($pluginManager);

        if (I18nModule::isTransifexEnabled($container)) {
            $pluginManager->setService(
                TransifexThemeMessageLoader::class,
                $container->get(TransifexThemeMessageLoader::class)
            );
            $delegate->addRemoteTranslations(TransifexThemeMessageLoader::class);
        }

        // Add Madoc translations.
        $pluginManager->setService(MadocMessageLoader::class, $container->get(MadocMessageLoader::class));
//        $delegate->addRemoteTranslations(MadocMessageLoader::class);

        return $translator;
    }
}

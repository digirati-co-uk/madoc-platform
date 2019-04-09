<?php

namespace i18n;

use i18n\Controller\LanguageSelectionController;
use i18n\Event\TransifexProjectListener;
use i18n\Event\TranslatableResourceListener;
use i18n\Form\LocalizationConfigForm;
use i18n\Job\TransifexExportJob;
use i18n\Job\TransifexItemExportJob;
use i18n\Site\LocalizationListener;
use Omeka\Module\AbstractModule;
use Psr\Container\ContainerInterface;
use Zend\Config\Factory;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\ModuleManager\Feature\InitProviderInterface;
use Zend\ModuleManager\ModuleEvent;
use Zend\ModuleManager\ModuleManagerInterface;
use Zend\Mvc\Controller\AbstractController;
use Zend\Mvc\MvcEvent;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\Session\Container;
use Zend\View\Renderer\PhpRenderer;

if (file_exists(__DIR__.'/vendor/autoload.php')) {
    require_once __DIR__.'/vendor/autoload.php';
}

class Module extends AbstractModule implements InitProviderInterface
{
    /**
     * Check whether the Omeka setting is toggled to enable localization features using Transifex.  This
     * flag prevents any services accidentally lazy loading anything from Transifex while `transifex.apikey` and
     * `transifex.secret_key` aren't present.
     *
     * @return bool
     */
    public static function isFeatureFlagEnabled(ContainerInterface $container)
    {
        $config = $container->get('Config');
        $transifexConfig = $config['transifex'] ?? [];

        if (!isset($transifexConfig['apikey']) || empty($transifexConfig['apikey']) ||
            !isset($transifexConfig['secret_key']) || empty($transifexConfig['secret_key'])) {
            return false;
        }

        $globalSettings = $container->get('Omeka\Settings');
        $localizationSettings = $globalSettings->get('i18n', []);

        return isset($localizationSettings['enabled']) && true === (bool) $localizationSettings['enabled'];
    }

    /**
     * Attach a configuration listener to override the main site routing.
     */
    public function init(ModuleManagerInterface $moduleManager)
    {
        $events = $moduleManager->getEventManager();
        $events->attach(ModuleEvent::EVENT_MERGE_CONFIG, array($this, 'onMergeConfig'));
    }

    /**
     * Attach Omeka resource events that trigger translation exports.
     */
    public function attachListeners(SharedEventManagerInterface $events)
    {
        $serviceLocator = $this->getServiceLocator();

        if (!self::isFeatureFlagEnabled($serviceLocator)) {
            return;
        }

        $events->attach(
            '*',
            'api.hydrate.post',
            $serviceLocator->get(TransifexProjectListener::class),
            2
        );

        $events->attach(
            '*',
            'api.hydrate.post',
            $serviceLocator->get(TranslatableResourceListener::class),
            1
        );
    }

    /**
     * Override the default routing configuration to add an option locale prefix parameter
     * to site-level routing.
     */
    public function onMergeConfig(ModuleEvent $e)
    {
        $configListener = $e->getConfigListener();
        $config = $configListener->getMergedConfig(false);
        $config['router']['routes']['site']['options']['route'] = '[/:locale]/s/:site-slug';

        $configListener->setMergedConfig($config);
    }

    /**
     * Get the service container configuration for this module.
     *
     * @return array|\Zend\Config\Config
     */
    public function getConfig()
    {
        return Factory::fromFiles(glob(__DIR__.'/config/*.config.*'));
    }

    public function upgrade($oldVersion, $newVersion, ServiceLocatorInterface $serviceLocator)
    {
        if (version_compare($oldVersion, '0.1', '<=')) {
            // @todo - migrate page translations to transifex
            $this->installOrUpgrade($serviceLocator);
        }
    }

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        $serviceLocator = $event->getApplication()->getServiceManager();

        if (!self::isFeatureFlagEnabled($serviceLocator)) {
            $events = $event->getApplication()->getEventManager();
            $events->attach(MvcEvent::EVENT_ROUTE, $serviceLocator->get(LocalizationListener::class));
        }

        $defaultLocale = 'en';
        $sessionContainer = Container::getDefaultManager();
        $session = $sessionContainer->getStorage();

        if (null !== $session && isset($session['locale'])) {
            $defaultLocale = $session['locale'];
        }

        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            [
                LanguageSelectionController::class,
            ]
        );
    }

    public function getConfigForm(PhpRenderer $renderer)
    {
        $serviceLocator = $this->getServiceLocator();

        $form = new LocalizationConfigForm(
            'localization',
            [
                'enabled' => self::isFeatureFlagEnabled($serviceLocator),
            ]
        );

        $form->init();

        return $renderer->formCollection($form, false);
    }

    public function handleConfigForm(AbstractController $controller)
    {
        $globalSettings = $this->getServiceLocator()->get('Omeka\Settings');
        $config = $this->getServiceLocator()->get('Config');
        $formData = $controller->params()->fromPost();

        $localizationSettings = $globalSettings->get(
            'i18n',
            [
                'enabled' => false,
            ]
        );

        if (true === boolval($formData['enable'])) {
            $transifex = $config['transifex'] ?: [];
            if (!isset($transifex['apikey']) || empty($transifex['apikey']) ||
                !isset($transifex['secret_key']) || empty($transifex['secret_key'])) {
                $controller->getPluginManager()->get('messenger')->addError(
                    'Refusing to enable transifex, no `transifex.apikey` or '.
                    '`transifex.secret_key` configuration option set'
                );

                return;
            }

            $localizationSettings['enabled'] = true;
            $globalSettings->set('i18n', $localizationSettings);

            $this->installOrUpgrade($this->getServiceLocator());
        } else {
            $localizationSettings['enabled'] = false;
        }
    }

    public function install(ServiceLocatorInterface $serviceLocator)
    {
        $this->installOrUpgrade($serviceLocator);
    }

    private function installOrUpgrade(ServiceLocatorInterface $services)
    {
        if (self::isFeatureFlagEnabled($services)) {
            $jobDispatcher = $services->get('Omeka\JobDispatcher');
            $jobDispatcher->dispatch(TransifexItemExportJob::class, []);

            $api = $services->get('Omeka\ApiManager');

            foreach ($api->search('sites')->getContent() as $site) {
                $jobDispatcher->dispatch(
                    TransifexExportJob::class,
                    [
                        'site_slug' => $site->slug(),
                    ]
                );
            }
        }
    }
}

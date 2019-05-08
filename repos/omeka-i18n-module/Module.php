<?php

namespace i18n;

use Digirati\OmekaShared\ModuleExtensions\ConfigurationFormAutoloader;
use i18n\Controller\AdminTranslations;
use i18n\Controller\LanguageSelectionController;
use i18n\Event\TransifexProjectListener;
use i18n\Event\TranslatableResourceListener;
use i18n\Form\LocalizationConfigForm;
use i18n\Job\TransifexExportJob;
use i18n\Job\TransifexItemExportJob;
use i18n\Site\LocalizationListener;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Form\SiteSettingsForm;
use Omeka\Module\AbstractModule;
use Omeka\Settings\Settings;
use Psr\Container\ContainerInterface;
use Zend\Config\Config;
use Zend\Config\Factory;
use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Form\Element\Checkbox;
use Zend\Form\Fieldset;
use Zend\I18n\Translator\TranslatorInterface;
use Zend\ModuleManager\Feature\InitProviderInterface;
use Zend\ModuleManager\ModuleEvent;
use Zend\ModuleManager\ModuleManagerInterface;
use Zend\Mvc\Controller\AbstractController;
use Zend\Mvc\I18n\Translator;
use Zend\Mvc\MvcEvent;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\ServiceManager;
use Zend\Session\Container;
use Zend\View\Renderer\PhpRenderer;
use Zend\View\Renderer\RendererInterface;

class Module extends AbstractModule implements InitProviderInterface
{
    use ConfigurationFormAutoloader;

    /**
     * Check whether the Omeka setting is toggled to enable localization features using Transifex.  This
     * flag prevents any services accidentally lazy loading anything from Transifex while `transifex.apikey` and
     * `transifex.secret_key` aren't present.
     *
     * @param ContainerInterface $container
     * @return bool
     */
    public static function isFeatureFlagEnabled(ContainerInterface $container)
    {
        /** @var Settings $globalSettings */
        $globalSettings = $container->get('Omeka\Settings');

        return boolval($globalSettings->get('i18n_enabled', false));
    }

    public static function isTransifexEnabled(ContainerInterface $container)
    {
        $config = $container->get('Config');
        $transifexConfig = $config['transifex'] ?? [];

        if (!isset($transifexConfig['apikey']) || empty($transifexConfig['apikey']) ||
            !isset($transifexConfig['secret_key']) || empty($transifexConfig['secret_key'])) {
            return false;
        }

        $globalSettings = $container->get('Omeka\Settings');
        $transifexEnabled = boolval($globalSettings->get('i18n_transifex-enabled', false));

        return (
            $transifexEnabled && self::isFeatureFlagEnabled($container)
        );
    }

    /**
     * Attach a configuration listener to override the main site routing.
     *
     * @param ModuleManagerInterface $moduleManager
     */
    public function init(ModuleManagerInterface $moduleManager)
    {
        $events = $moduleManager->getEventManager();
        $events->attach(ModuleEvent::EVENT_MERGE_CONFIG, array($this, 'onMergeConfig'));
    }

    /**
     * Attach Omeka resource events that trigger translation exports.
     *
     * @param SharedEventManagerInterface $events
     */
    public function attachListeners(SharedEventManagerInterface $events)
    {
        $serviceLocator = $this->getServiceLocator();

        $events->attach(SiteSettingsForm::class, 'form.add_elements', function (Event $event) {
            /** @var SiteSettingsForm $form */
            $form = $event->getTarget();
            $this->extendSiteSettings($event, $form);
        });

        if (!self::isTransifexEnabled($serviceLocator)) {
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

    public function extendSiteSettings(Event $event, SiteSettingsForm $form)
    {
        $form->add(
            (new Fieldset('i18n'))
                ->add(
                    (new Checkbox('i18n-multi-lingual-site'))
                        ->setOptions([
                            'label' => 'Multi-lingual site', // @translate
                            'info' => 'This will change the URL of the site based on the current locale' // @translate
                        ])
                        ->setValue($form->getSiteSettings()->get('i18n-multi-lingual-site', false))
                )
                ->add(
                    (new Checkbox('i18n-redirect-from-multi-lingual'))
                        ->setOptions([
                            'label' => 'Redirect to default site path', // @translate
                            'info' => 'This will redirect from /en/s/site to /s/site automatically' // @translate
                        ])
                        ->setValue($form->getSiteSettings()->get('i18n-redirect-from-multi-lingual', false))
                )
                ->setLabel('Internationalisation') // @translate
        );
    }

    /**
     * Override the default routing configuration to add an option locale prefix parameter
     * to site-level routing.
     *
     * @param ModuleEvent $e
     */
    public function onMergeConfig(ModuleEvent $e)
    {
        $configListener = $e->getConfigListener();
        $config = $configListener->getMergedConfig(false);
        $config['router']['routes']['site']['options']['route'] = '[/:locale]/s/:site-slug';
        $config['router']['routes']['site']['options']['skippable']['locale'] = true;
        $config['router']['routes']['site']['type'] = 'SkippableSegment';

        $configListener->setMergedConfig($config);
    }

    /**
     * Get the service container configuration for this module.
     *
     * @return array|\Zend\Config\Config
     */
    public function getConfig()
    {
        return Factory::fromFiles(glob(__DIR__ . '/config/*.config.*'));
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

        if (self::isFeatureFlagEnabled($serviceLocator)) {
            $events = $event->getApplication()->getEventManager();
            $events->attach(MvcEvent::EVENT_ROUTE, $serviceLocator->get(LocalizationListener::class));
        }

        // @todo this doesn't appear to be being used.
//        $defaultLocale = 'en';
//        $sessionContainer = Container::getDefaultManager();
//        $session = $sessionContainer->getStorage();
//
//        if (null !== $session && isset($session['locale'])) {
//            $defaultLocale = $session['locale'];
//        }

        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            [
                LanguageSelectionController::class,
            ]
        );
    }

    public function handleConfigForm(AbstractController $controller)
    {
        /** @var Settings $settings */
        $settings = $this->getServiceLocator()->get('Omeka\Settings');
        /** @var LocalizationConfigForm $form */
        $form = LocalizationConfigForm::fromPost($controller->params()->fromPost());
        /** @var Config $formData */
        $config = $this->getServiceLocator()->get('Config');

        if (!$form->isValid()) {
            $controller->messenger()->addErrors($form->getMessages());
            return false;
        }

        $formData = $form->getData();

        if (true === boolval($formData['transifex-enabled'])) {
            $transifex = $config['transifex'] ?: [];
            if (!isset($transifex['apikey']) || empty($transifex['apikey']) ||
                !isset($transifex['secret_key']) || empty($transifex['secret_key'])) {
                $controller->messenger()->addError(
                    'Refusing to enable transifex, no `transifex.apikey` or ' .
                    '`transifex.secret_key` configuration option set'
                );
                return false;
            }
        }

        if ($formData['transifex-enabled'] === true) {
            $this->installOrUpgrade($this->getServiceLocator());
        }

        return $form->saveToSettings($settings);
    }

    public function install(ServiceLocatorInterface $serviceLocator)
    {
        $this->installOrUpgrade($serviceLocator);
    }

    private function installOrUpgrade(ServiceLocatorInterface $services)
    {
        if (self::isTransifexEnabled($services)) {
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

    function getConfigFormClass(): string
    {
        return LocalizationConfigForm::class;
    }
}

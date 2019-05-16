<?php

namespace AnnotationStudio;

use AnnotationStudio\Admin\ConfigurationForm;
use AnnotationStudio\CaptureModel\Router;
use AnnotationStudio\Controller\CaptureModelController;
use AnnotationStudio\Subscriber\ModerationStatusVerificationSubscriber;
use Digirati\OmekaShared\Helper\LocaleHelper;
use Digirati\OmekaShared\Helper\SettingsHelper;
use Digirati\OmekaShared\Helper\UrlHelper;
use Digirati\OmekaShared\ModuleExtensions\ConfigurationFormAutoloader;
use IIIF\Model\Manifest;
use IIIFStorage\Model\CanvasRepresentation;
use IIIFStorage\Model\ManifestRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Form\SiteSettingsForm;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Acl;
use Omeka\Settings\SiteSettings;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\GenericEvent;
use Throwable;
use Zend\Config\Factory;
use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Form\Element\Checkbox;
use Zend\Form\Element\Text;
use Zend\Form\Fieldset;
use Zend\Mvc\MvcEvent;
use Zend\View\Model\ViewModel;

class Module extends AbstractModule
{
    private $config;

    use ConfigurationFormAutoloader;

    function getConfigFormClass(): string
    {
        return ConfigurationForm::class;
    }

    public function loadVendor()
    {
        if (file_exists(__DIR__ . '/build/vendor-dist/autoload.php')) {
            require_once __DIR__ . '/build/vendor-dist/autoload.php';
        } elseif (file_exists(__DIR__ . '/vendor/autoload.php')) {
            require_once __DIR__ . '/vendor/autoload.php';
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
            glob(__DIR__ . '/config/*.config.*')
        );

        return $this->config;
    }

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);
        $this->addAclRules();
    }

    private function addAclRules()
    {
        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            [
                CaptureModelController::class,
            ]
        );
    }

    private function getCaptureModelUrl($type, $id = null)
    {

        /** @var SettingsHelper $siteModerationStatus */
        $siteSettings = $this->getServiceLocator()->get(SettingsHelper::class);
        /** @var $settings \Omeka\Settings\Settings */
        $settings = $this->getServiceLocator()->get('Omeka\Settings');

        $currentSite = $this->getCurrentSite();
        // Static capture model on site.
        $staticCaptureModel = $siteSettings->get('annotation-studio-static-capture-model', '');
        if ($staticCaptureModel) {
            return $staticCaptureModel;
        }

        /** @var Router $router */
        $router = $this->getServiceLocator()->get(Router::class);

        if ($currentSite) {
            $router->setSiteId($currentSite->id());
        }

        $moderation = $siteSettings->get('annotation-studio-moderation-status', '')
            ? $siteSettings->get('annotation-studio-moderation-status', '')
            : $settings->get('annotation_studio_default_moderation_status', 'open');

        if ($id) {
            return $router->model($id, $type, $moderation, !!$currentSite);
        }
        return $router->component($type, $moderation, !!$currentSite);
    }

    /** @return SiteRepresentation|null */
    public function getCurrentSite()
    {
        /** @var \Omeka\Mvc\Controller\Plugin\CurrentSite $site */
        $site = $this->getServiceLocator()->get('ControllerPluginManager')->get('currentSite');

        if (!$site) {
            return null;
        }

        return $site();
    }

    public function getElucidateEndpoint()
    {
        /** @var SettingsHelper $siteModerationStatus */
        $siteSettings = $this->getServiceLocator()->get(SettingsHelper::class);
        // Static elucidate on site.
        $staticElucidate = $siteSettings->get('annotation-studio-static-elucidate', '');
        if ($staticElucidate) {
            return $staticElucidate;
        }

        /** @var SiteSettings  $settings */
        $elucidate = getenv('OMEKA__ELUCIDATE_URL');
        $elucidateProxy = getenv('OMEKA__ELUCIDATE_PUBLIC_DOMAIN') || $elucidate;
        if ($elucidateProxy) {
            /** @var UrlHelper $url */
            $url = $this->getServiceLocator()->get(UrlHelper::class);
            try {
                $elucidate = $url->create('elucidate-proxy-root/post-container', [], ['force_canonical' => true], true);
                if ('/' !== strpos($elucidate, -1)) {
                    $elucidate = $elucidate . '/';
                }
            } catch (Throwable $e) {
                error_log('Its likely the elucidate proxy is not enabled, causing an error.');
                error_log($e);
            }
        }

        return $elucidate;
    }

    public function attachListeners(SharedEventManagerInterface $sharedEventManager)
    {
        $settings = $this->getServiceLocator()->get('Omeka\Settings');
        $serviceContainer = $this->getServiceLocator();
        /** @var EventDispatcher */
        $eventDispatcher = $serviceContainer->get(EventDispatcher::class);
        /** @var ModerationStatusVerificationSubscriber $elucidateSubscriber */
        $elucidateSubscriber = $serviceContainer->get(ModerationStatusVerificationSubscriber::class);
        /** @var LocaleHelper $localeHelper */
        $localeHelper = $serviceContainer->get(LocaleHelper::class);
        $eventDispatcher->addSubscriber($elucidateSubscriber);

        $sharedEventManager->attach(SiteSettingsForm::class, 'form.add_elements', function (Event $event) {
            /** @var SiteSettingsForm $form */
            $form = $event->getTarget();

            $form->add(
                (new Fieldset('annotation-studio'))
                    ->add(
                        (new Text('annotation-studio-moderation-status'))
                            ->setOptions([
                                'label' => 'Default moderation status', // @translate
                                'info' => 'Moderation status that will be applied to annotations created', // @translate
                            ])
                            ->setAttribute('required', false)
                            ->setValue(
                                $form->getSiteSettings()->get('annotation-studio-moderation-status', 'open')
                            )
                    )
                    ->add(
                        (new Text('annotation-studio-static-capture-model'))
                            ->setOptions([
                                'label' => 'Static capture model', // @translate
                                'info' => 'A full URL to an external capture model to use for this site', // @translate
                            ])
                            ->setAttribute('required', false)
                            ->setValue(
                                $form->getSiteSettings()->get('annotation-studio-static-capture-model', '')
                            )
                    )
                    ->add(
                        (new Text('annotation-studio-static-elucidate'))
                            ->setOptions([
                                'label' => 'Static elucidate', // @translate
                                'info' => 'A full URL to an external elucidate to use for this site', // @translate
                            ])
                            ->setAttribute('required', false)
                            ->setValue(
                                $form->getSiteSettings()->get('annotation-studio-static-elucidate', '')
                            )
                    )
                    ->setOptions([
                        'label' => 'Annotation studio',
                    ])
            );
        });

        $eventDispatcher->addListener('iiif.canvas.view', function (GenericEvent $event) use ($settings, $localeHelper) {
            /** @var CanvasRepresentation $canvas */
            $canvas = $event->getSubject();
            /** @var ViewModel $viewModel */
            $vm = $event->getArgument('viewModel');
            /** @var Manifest $manifest */
            $manifest = $vm->getVariable('manifest');
            /** @var AnnotationStudio $annotationStudio */
            $annotationStudio = $vm->getVariable('annotationStudio', new AnnotationStudio());
            $elucidate = $this->getElucidateEndpoint();
            $useOsd = $settings->get('annotation_studio_use_open_seadragon', true);
            $googleMapApiKey = $settings->get('annotation_studio_google_map_api');

            if (!$manifest || !$canvas) return;

            $annotationStudio = AnnotationStudioFactory::forCanvasPage($manifest, $canvas->getCanvas(), $annotationStudio)
                ->attachElucidateServer($elucidate)
                ->setGoogleMapApiKey($googleMapApiKey)
                ->withResourceEditor($this->getCaptureModelUrl('resource'))
                ->withTranscriber($this->getCaptureModelUrl('transcriber'))
                ->withRegionAnnotations()
                ->withDrafts()
                ->withTagging($this->getCaptureModelUrl('tagging'))
                ->withViewer($useOsd ? 'OpenSeadragonViewer' : 'StaticImageViewer')
                ->withLocale($localeHelper->getLocale())
                ->build();

            $vm->setVariable('annotationStudio', $annotationStudio);
        });

        $eventDispatcher->addListener('iiif.manifest.view', function (GenericEvent $event) use ($settings, $localeHelper) {
            /** @var ManifestRepresentation $manifest */
            $manifest = $event->getSubject();
            /** @var ViewModel $viewModel */
            $vm = $event->getArgument('viewModel');
            /** @var AnnotationStudio $annotationStudio */
            $annotationStudio = $vm->getVariable('annotationStudio', new AnnotationStudio());
            $canvases = $manifest->getManifest()->getCanvases();
            $useOsd = $settings->get('annotation_studio_use_open_seadragon', true);
            $elucidate = $this->getElucidateEndpoint();
            $googleMapApiKey = $settings->get('annotation_studio_google_map_api');

            if (!$manifest) return;

            // Single Man
            if (1 === count($canvases)) {
                $canvas = $canvases[0];
                $annotationStudio = AnnotationStudioFactory::forCanvasPage($manifest->getManifest(), $canvas, $annotationStudio)
                    ->attachElucidateServer($elucidate)
                    ->setGoogleMapApiKey($googleMapApiKey)
                    ->withResourceEditor($this->getCaptureModelUrl('resource'))
                    ->withRegionAnnotations()
                    ->withDrafts()
                    ->withTagging()
                    ->withViewer($useOsd ? 'OpenSeadragonViewer' : 'StaticImageViewer')
                    ->withLocale($localeHelper->getLocale())
                    ->build();
            } else {
                $annotationStudio = AnnotationStudioFactory::forManifestPage($manifest->getManifest(), $annotationStudio)
                    ->attachElucidateServer($elucidate)
                    ->setGoogleMapApiKey($googleMapApiKey)
                    ->withResourceEditor($this->getCaptureModelUrl('resource'))
                    ->withLocale($localeHelper->getLocale())
                    ->build();
            }
            $vm->setVariable('annotationStudio', $annotationStudio);
        });
    }
}

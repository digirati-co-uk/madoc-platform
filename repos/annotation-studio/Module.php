<?php

namespace AnnotationStudio;

use AnnotationStudio\Admin\ConfigurationForm;
use AnnotationStudio\CaptureModel\Router;
use AnnotationStudio\Controller\CaptureModelController;
use AnnotationStudio\Subscriber\ModerationStatusVerificationSubscriber;
use Digirati\OmekaShared\Helper\UrlHelper;
use Digirati\OmekaShared\ModuleExtensions\ConfigurationFormAutoloader;
use IIIF\Model\Canvas;
use IIIF\Model\Manifest;
use IIIFStorage\Model\CanvasRepresentation;
use IIIFStorage\Model\ManifestRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Module\AbstractModule;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\GenericEvent;
use Symfony\Component\Yaml\Yaml as SymfonyYaml;
use Throwable;
use Zend\Config\Factory;
use Zend\Config\Reader\Yaml as YamlConfig;
use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Mvc\MvcEvent;
use Zend\Uri\Uri;
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
        /** @var $settings \Omeka\Settings\Settings */
        $settings = $this->getServiceLocator()->get('Omeka\Settings');
        $currentSite = $this->getCurrentSite();
        $router = $this->getServiceLocator()->get(Router::class);

        if ($currentSite) {
            $router->setSiteId($currentSite->id());
        }

        $moderation = $settings->get('annotation_studio_default_moderation_status', 'open');

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

    public function getElucidateEndpoint($settings)
    {
        $elucidate = $settings->get('annotation_studio_elucidate_server');
        $elucidateProxy = $settings->get('annotation_studio_use_elucidate_proxy');
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
        $eventDispatcher->addSubscriber($elucidateSubscriber);

        $eventDispatcher->addListener('iiif.canvas.view', function (GenericEvent $event) use ($settings) {
            /** @var CanvasRepresentation $canvas */
            $canvas = $event->getSubject();
            /** @var ViewModel $viewModel */
            $vm = $event->getArgument('viewModel');
            /** @var Manifest $manifest */
            $manifest = $vm->getVariable('manifest');
            /** @var AnnotationStudio $annotationStudio */
            $annotationStudio = $vm->getVariable('annotationStudio', new AnnotationStudio());
            $elucidate = $this->getElucidateEndpoint($settings);
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
                ->build();

            $vm->setVariable('annotationStudio', $annotationStudio);
        });

        $eventDispatcher->addListener('iiif.manifest.view', function (GenericEvent $event) use ($settings) {
            /** @var ManifestRepresentation $manifest */
            $manifest = $event->getSubject();
            /** @var ViewModel $viewModel */
            $vm = $event->getArgument('viewModel');
            /** @var AnnotationStudio $annotationStudio */
            $annotationStudio = $vm->getVariable('annotationStudio', new AnnotationStudio());
            $canvases = $manifest->getManifest()->getCanvases();
            $useOsd = $settings->get('annotation_studio_use_open_seadragon', true);
            $elucidate = $this->getElucidateEndpoint($settings);
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
                    ->build();
            } else {
                $annotationStudio = AnnotationStudioFactory::forManifestPage($manifest->getManifest(), $annotationStudio)
                    ->attachElucidateServer($elucidate)
                    ->setGoogleMapApiKey($googleMapApiKey)
                    ->withResourceEditor($this->getCaptureModelUrl('resource'))
                    ->build();
            }
            $vm->setVariable('annotationStudio', $annotationStudio);
        });
    }
}

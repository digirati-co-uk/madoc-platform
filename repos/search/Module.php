<?php

namespace MadocSearch;

use Digirati\OmekaShared\ModuleExtensions\ConfigurationFormAutoloader;
use Elucidate\Event\AnnotationLifecycleEvent;
use GuzzleHttp\Client;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Acl;
use MadocSearch\Admin\ConfigurationForm;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Zend\Config\Factory;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\ModuleManager\Feature\ConfigProviderInterface;
use Zend\Mvc\MvcEvent;
use Zend\Uri\Uri;

class Module extends AbstractModule implements ConfigProviderInterface
{
    use ConfigurationFormAutoloader;

    private $config;

    public function getConfig()
    {
        if ($this->config) {
            return $this->config;
        }

        // Load our configuration.
        $this->config = Factory::fromFiles(
            glob(__DIR__ . '/config/*.config.*')
        );

        return $this->config;
    }

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            []
        );
    }

    public function attachListeners(SharedEventManagerInterface $em)
    {
        $container = $this->getServiceLocator();
        // @todo better feature flagging system.
        if ($container->has(EventDispatcher::class) && getenv('OMEKA__ELUCIDATE_URL')) {
            /** @var EventDispatcher $ev */
            $ev = $container->get(EventDispatcher::class);

            // @todo clean up a lot of the noise of the configuration, move to subscriber.
            //       It will adapt with the indexer, but getting the annotations into elasticsearch
            //       is a good starting point.
            $ev->addListener(AnnotationLifecycleEvent::CREATE, function (AnnotationLifecycleEvent $event) {
                try {
                    $annotation = $event->getOriginalAnnotation();
                    $internalAnnotationServer = getenv('OMEKA__ELUCIDATE_URL');
                    $internalAnnotationServerUri = new Uri(
                        substr($internalAnnotationServer, 0, 4) === 'http'
                            ? $internalAnnotationServer
                            : 'http://' . $internalAnnotationServer
                    );
                    $internalOmekaServer = getenv('OMEKA__INTERNAL_URL');
                    $internalOmekaServerUri = new Uri($internalOmekaServer);
                    $annotationIndexer = getenv('OMEKA__ANNOTATION_INDEXER');
                    $mainSite = getenv('OMEKA__MAIN_SITE_DOMAIN');
                    $mainSiteUri = new Uri($mainSite);

                    if (!$annotation['generator'] || !$annotationIndexer) {
                        return;
                    }

                    $captureModel = $annotation['generator'];
                    $generator = new Uri($captureModel);
                    if ($generator->getHost() === $mainSiteUri->getHost() && $internalOmekaServer) {
                        $generator->setHost($internalOmekaServerUri->getHost());
                        $generator->setPort($internalOmekaServerUri->getPort());
                        $generator->setScheme($internalOmekaServerUri->getScheme());
                    }

                    $annotationId = $annotation['id'];
                    $annotationUri = new Uri($annotationId);
                    if ($annotationUri->getHost() === $mainSiteUri->getHost() && $internalAnnotationServer) {
                        $annotationUri->setHost($internalAnnotationServerUri->getHost());
                        $annotationUri->setPort($internalAnnotationServerUri->getPort());
                        $annotationUri->setScheme($internalAnnotationServerUri->getScheme());
                    }

                    // Special case for part-of
                    $partOf = is_array($annotation['target']) ? $annotation['target']['dcterms:isPartOf']['id'] ?? '' : '';
                    $partOfUri = $partOf ? new Uri($partOf) : null;
                    if ($partOfUri && $partOfUri->getHost() === $mainSiteUri->getHost() && $internalOmekaServer) {
                        $partOfUri->setHost($internalOmekaServerUri->getHost());
                        $partOfUri->setPort($internalOmekaServerUri->getPort());
                        $partOfUri->setScheme($internalOmekaServerUri->getScheme());
                    }

                    $url = new Uri($annotationIndexer);
                    $url->setPath('/index-annotation');
                    $url->setQuery([
                        'annotation' => $annotationUri->toString(),
                        'capture_model' => $generator->toString(),
                        'manifest' => $partOfUri ? $partOfUri->toString() : '',
                    ]);

                    $client = new Client();
                    $client->get($url->toString());

                } catch (\Throwable $e) {
                    error_log($e->getMessage());
                }
            });
        }
    }

    function getConfigFormClass(): string
    {
        return ConfigurationForm::class;
    }
}

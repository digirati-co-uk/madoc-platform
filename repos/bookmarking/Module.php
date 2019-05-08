<?php

namespace Bookmarking;

use Bookmarking\Controller\BookmarkController;
use Bookmarking\Form\SimpleBookmarkForm;
use Digirati\OmekaShared\Helper\UrlHelper;
use IIIF\Model\Canvas;
use IIIF\Model\Manifest;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Acl;
use Zend\Config\Factory;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Http\Request;
use Zend\EventManager\Event;
use Zend\Mvc\MvcEvent;
use Zend\ServiceManager\ServiceLocatorInterface;
use Elucidate\Client as ElucidateClient;
use Zend\View\Model\ViewModel;

class Module extends AbstractModule
{
    private $config;

    const CANVAS_VIEW_EVENT = 'iiif.canvas.view';
    const MANIFEST_VIEW_EVENT = 'iiif.manifest.view';

    public function getConfig()
    {
        if ($this->config) {
            return $this->config;
        }
        // Load our configuration.
        $this->config = Factory::fromFiles(
            glob(__DIR__.'/config/*.config.*')
        );

        return $this->config;
    }

    private function createBookmarkForm($subject, $redirect)
    {
        $form = new SimpleBookmarkForm();
        $form->init();
        $form->populateValues([
            'subject' => $subject,
            'redirect_to' => $redirect,
        ]);

        $urlHelper = $this->getServiceLocator()->get(UrlHelper::class);
        $bookmarkUrl = $urlHelper->create('service-bookmark');

        $form->setAttribute('action', $bookmarkUrl);

        return $form;
    }

    public function attachListeners(SharedEventManagerInterface $sharedEventManager)
    {
        /** @var ServiceLocatorInterface $di */
        $di = $this->getServiceLocator();
        if ($di->has(ElucidateClient::class)) {
            // We have elucidate client.
            $sharedEventManager->attach('*', static::CANVAS_VIEW_EVENT, function (Event $event) {
                /** @var Request $request */
                $request = $event->getParam('request');
                /** @var Canvas $canvas */
                $canvas = $event->getParam('canvas');
                if ($canvas) {
                    $form = $this->createBookmarkForm($canvas->getId(), $request->getUriString());
                    $canvas->addMetaData(['bookmark' => $form]);
                }
                /** @var Manifest $manifest */
                $manifest = $event->getParam('manifest');
                if ($manifest) {
                    $form = $this->createBookmarkForm($manifest->getId(), $request->getUriString());
                    $manifest->addMetaData(['bookmark' => $form]);
                }

                /** @var ViewModel $vm */
                $vm = $event->getParam('viewModel');
                $form = $this->createBookmarkForm($request->getUriString(), $request->getUriString());
                $vm->setVariable('bookmarkPage', $form);
            });

            $sharedEventManager->attach('*', static::MANIFEST_VIEW_EVENT, function (Event $event) {
                /** @var Request $request */
                $request = $event->getParam('request');
                /** @var Manifest $manifest */
                $manifest = $event->getParam('manifest');
                if ($manifest) {
                    $form = $this->createBookmarkForm($manifest->getId(), $request->getUriString());
                    $manifest->addMetaData(['bookmark' => $form]);
                }

                /** @var ViewModel $vm */
                $vm = $event->getParam('viewModel');
                $form = $this->createBookmarkForm($request->getUriString(), $request->getUriString());
                $vm->setVariable('bookmarkPage', $form);
            });
        }
    }

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            [
                BookmarkController::class,
            ]
        );
    }
}

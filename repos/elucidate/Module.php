<?php

namespace ElucidateModule;

use Digirati\OmekaShared\ModuleExtensions\ConfigurationFormAutoloader;
use ElucidateModule\Admin\ConfigurationForm;
use ElucidateModule\Controller\ActivityController;
use ElucidateModule\Controller\CommentController;
use ElucidateModule\Controller\CompletionController;
use ElucidateModule\Controller\FlaggingController;
use ElucidateModule\Controller\ItemController;
use ElucidateModule\Controller\SearchController;
use ElucidateModule\Controller\TopicTypesController;
use ElucidateModule\Domain\ViewEventSubscriber;
use ElucidateModule\Subscriber\AnnotationModerationSubscriber;
use ElucidateModule\Subscriber\BookmarkSubscriber;
use ElucidateModule\Subscriber\CommentSubscriber;
use ElucidateModule\Subscriber\CompletionSubscriber;
use ElucidateModule\Subscriber\CreatedTimestampSubscriber;
use ElucidateModule\Subscriber\ElucidateItemImporter;
use ElucidateModule\Subscriber\FlaggingNotificationSubscriber;
use ElucidateModule\Subscriber\FlaggingSubscriber;
use ElucidateModule\Subscriber\TaggingSubscriber;
use ElucidateModule\Subscriber\TranscriptionSubscriber;
use ElucidateModule\Subscriber\UserBookmarksSubscriber;
use ElucidateModule\View\CanvasView;
use ElucidateModule\View\ManifestView;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Acl;
use Omeka\Settings\Settings;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Zend\Config\Factory;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Mvc\MvcEvent;

class Module extends AbstractModule
{
    use ConfigurationFormAutoloader;

    private $config;

    public function getConfig()
    {
        if ($this->config) {
            return $this->config;
        }
        // Load our composer dependencies.
        $this->loadVendor();

        // Load our configuration.
        $this->config = Factory::fromFiles(
            glob(__DIR__.'/config/*.config.*')
        );

        return $this->config;
    }

    public function loadVendor()
    {
        if (file_exists(__DIR__.'/build/vendor-dist/autoload.php')) {
            require_once __DIR__.'/build/vendor-dist/autoload.php';
        } elseif (file_exists(__DIR__.'/vendor/autoload.php')) {
            require_once __DIR__.'/vendor/autoload.php';
        }
    }

    public function attachListeners(SharedEventManagerInterface $em)
    {
        $di = $this->getServiceLocator();
        /** @var Settings $settings */
        $settings = $di->get('Omeka\Settings');
        /** @var ViewEventSubscriber $viewSubscriber */
        $viewSubscriber = $di->get(ViewEventSubscriber::class);
        // Expand here as needed.
        $viewSubscriber->addView($di->get(CanvasView::class), 'iiif.canvas.view');
        $viewSubscriber->addView($di->get(ManifestView::class), 'iiif.manifest.view');
        //...
        // Finally attach them all.
        $viewSubscriber->attach($em);

        $serviceContainer = $this->getServiceLocator();
        // Symfony events.
        if ($serviceContainer->has(EventDispatcher::class) && getenv('OMEKA__ELUCIDATE_URL')) {

            $eventDispatcher = $serviceContainer->get(EventDispatcher::class);
            $elucidateSubscriber = $serviceContainer->get(ElucidateItemImporter::class);

            // The only conditional subscriber
            if ($settings->get('elucidate_import_omeka_items', false)) {
                $eventDispatcher->addSubscriber($elucidateSubscriber);
            }

            // The rest are added all together.
            $subscribers = [
                $serviceContainer->get(BookmarkSubscriber::class),
                $serviceContainer->get(FlaggingSubscriber::class),
                $serviceContainer->get(CompletionSubscriber::class),
                $serviceContainer->get(CommentSubscriber::class),
                $serviceContainer->get(TranscriptionSubscriber::class),
                $serviceContainer->get(TaggingSubscriber::class),
                $serviceContainer->get(CreatedTimestampSubscriber::class),
                $serviceContainer->get(FlaggingNotificationSubscriber::class),
                $serviceContainer->get(AnnotationModerationSubscriber::class),
                // Removing UserBookmarksSubscriber.
                // $serviceContainer->get(UserBookmarksSubscriber::class),
            ];

            foreach ($subscribers as $subscriber) {
                $eventDispatcher->addSubscriber($subscriber);
            }
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
                TopicTypesController::class,
                SearchController::class,
                ActivityController::class,
                ItemController::class,
                CompletionController::class,
                FlaggingController::class,
                CommentController::class,
            ]
        );
    }

    function getConfigFormClass(): string
    {
        return ConfigurationForm::class;
    }
}

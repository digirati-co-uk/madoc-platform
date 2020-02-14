<?php

namespace PublicUser\Module;

use Omeka\Entity\User;
use Omeka\Form\SiteSettingsForm;
use Psr\Container\ContainerInterface;
use PublicUser\Subscriber\AnnotationCreatorElucidateSubscriber;
use PublicUser\Subscriber\AnnotationStatsSubscriber;
use PublicUser\Subscriber\ManifestStatsSubscriber;
use PublicUser\Subscriber\PreDeleteCanvasSubscriber;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Zend\Authentication\AuthenticationService;
use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Mvc\MvcEvent;

trait EventListeners
{
    use SiteSettingExtension;

    /** @return ContainerInterface */
    abstract public function getServiceLocator();

    /**
     * @param SharedEventManagerInterface $sharedEventManager
     */
    public function attachListeners(SharedEventManagerInterface $sharedEventManager)
    {

        $serviceContainer = $this->getServiceLocator();
        $authenticationService = $serviceContainer->get('Omeka\AuthenticationService');
        $user = $authenticationService->getIdentity();

        if ($serviceContainer->has(EventDispatcher::class)) {
            /**
             * @var EventDispatcher
             * @var AnnotationCreatorElucidateSubscriber $elucidateSubscriber
             * @var AuthenticationService $authenticationService
             * @var User $user
             */
            $eventDispatcher = $serviceContainer->get(EventDispatcher::class);
            $elucidateSubscriber = $serviceContainer->get(AnnotationCreatorElucidateSubscriber::class);

            if ($user) {
                $elucidateSubscriber->setUser($user);
                $eventDispatcher->addSubscriber($elucidateSubscriber);
                $eventDispatcher->addSubscriber($serviceContainer->get(AnnotationStatsSubscriber::class));
            }
        }

        $sharedEventManager->attach('*', MvcEvent::EVENT_RENDER, function (MvcEvent $e) use ($user) {
            $layoutViewModel = $e->getViewModel();
            $childViewModels = $layoutViewModel->getChildren();
            if (count($childViewModels) === 0) {
                return;
            }
            $viewModel = $childViewModels[0];

            $viewModel->isLoggedIn = !!$user;
            $viewModel->currentUser = $user;
            $layoutViewModel->setVariable('isLoggedIn', !!$user);
            $layoutViewModel->setVariable('currentUser', $user);
        });

        // Pre-delete
        $preDelete = $serviceContainer->get(PreDeleteCanvasSubscriber::class);
        $preDelete->attach($sharedEventManager);

        // Manifest stats
        $manifestStats = $serviceContainer->get(ManifestStatsSubscriber::class);
        $manifestStats->attach($sharedEventManager);

        $acl = $serviceContainer->get('Omeka\Acl');
        $roles = $acl->getRoleLabels();
        // @todo fix when we get this.
        $roles['Transcriber'] = 'Transcriber';

        $sharedEventManager->attach(SiteSettingsForm::class, 'form.add_elements', function (Event $event) use ($roles) {
            /** @var SiteSettingsForm $form */
            $form = $event->getTarget();

            $this->extendSiteSettings($form);
        });
    }
}

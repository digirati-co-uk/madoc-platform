<?php

namespace ElucidateModule\Subscriber;

use ElucidateModule\Service\SearchClient;
use ElucidateModule\Service\UrlHelper;
use Omeka\Entity\User;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\View\Model\ViewModel;

class UserBookmarksSubscriber implements EventSubscriberInterface
{

    /**
     * @var SearchClient
     */
    private $search;

    public function __construct(
        SearchClient $search
    ) {
        $this->search = $search;
    }

    /**
     * Returns an array of event names this subscriber wants to listen to.
     *
     * The array keys are event names and the value can be:
     *
     * * The method name to call (priority defaults to 0)
     * * An array composed of the method name to call and the priority
     * * An array of arrays composed of the method names to call and respective
     *   priorities, or 0 if unset
     *
     * For instance:
     *
     * * array('eventName' => 'methodName')
     * * array('eventName' => array('methodName', $priority))
     * * array('eventName' => array(array('methodName1', $priority), array('methodName2'))
     *
     * @return array The event names to listen to
     */
    public static function getSubscribedEvents()
    {
        return [
            'user.profile' => ['addUserBookmarks'],
        ];
    }

    public function addUserBookmarks(GenericEvent $event)
    {
        /** @var ViewModel $viewModel */
        $viewModel = $event->getSubject();
        /** @var User $user */
        $user = $event->getArgument('user');
        // Add the bookmarks
        $viewModel->setVariable('userBookmarks', $this->search->userBookmarks($user->getId()));

    }
}

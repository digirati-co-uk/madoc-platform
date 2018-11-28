<?php

namespace ElucidateModule\Subscriber;

use Omeka\Api\Manager as ApiManager;
use Omeka\Api\Representation\UserRepresentation;
use Omeka\Permissions\Acl;
use Omeka\Stdlib\Mailer;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;

class FlaggingNotificationSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            'content.flagging' => 'triggerNotification',
        ];
    }

    /**
     * @var ApiManager
     */
    private $manager;

    /**
     * @var Mailer
     */
    private $mailer;

    public function __construct(ApiManager $manager, Mailer $mailer)
    {
        $this->manager = $manager;
        $this->mailer = $mailer;
    }

    public function triggerNotification(GenericEvent $event)
    {
        $data = $event->getSubject();

        $users = $this->manager->search('users')->getContent();
        $notifiedUsersAddressList = [];
        $notifiedUsers = array_filter(
            $users,
            function (UserRepresentation $user) {
                return in_array($user->role(), [Acl::ROLE_GLOBAL_ADMIN, Acl::ROLE_SITE_ADMIN]);
            }
        );

        /** @var UserRepresentation $user */
        foreach ($notifiedUsers as $user) {
            $notifiedUsersAddressList[$user->email()] = $user->name();
        }

        $message = $this->mailer->createMessage();
        $message->setTo($notifiedUsersAddressList);
        $message->setSubject('An item has been flagged');
        $message->setBody(
            "An item has been flagged.

Item: ${data['subject']}
Reason: ${data['reason']}
Details: ${data['detail']}"
        );

        try {
            $this->mailer->send($message);
        } catch (\Throwable $e) {
            // @todo log error.
        }
    }
}

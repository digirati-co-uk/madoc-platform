<?php

namespace ElucidateModule\Subscriber;

use Omeka\Api\Manager as ApiManager;
use Omeka\Api\Representation\UserRepresentation;
use Omeka\Permissions\Acl;
use Omeka\Stdlib\Mailer;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\Log\Logger;

class FlaggingNotificationSubscriber implements EventSubscriberInterface
{
    /**
     * @var Acl
     */
    private $acl;
    /**
     * @var Logger
     */
    private $logger;

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

    public function __construct(
        ApiManager $manager,
        Acl $acl,
        Mailer $mailer,
        Logger $logger
    ) {
        $this->manager = $manager;
        $this->acl = $acl;
        $this->mailer = $mailer;
        $this->logger = $logger;
    }

    public function triggerNotification(GenericEvent $event)
    {
        try {
            $data = $event->getSubject();

            $this->acl->allow(null, ['Omeka\Api\Adapter\UserAdapter']);
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

            $this->logger->info('Sending email to', $notifiedUsersAddressList);

            $message = $this->mailer->createMessage();
            $message->setTo($notifiedUsersAddressList);
            $message->setSubject('An item has been flagged');
            $message->setBody(
                "An item has been flagged.

Item: ${data['subject']}
Reason: ${data['reason']}
Details: ${data['detail']}"
            );


            $this->mailer->send($message);
        } catch (\Throwable $e) {
            error_log('Could not send email about reported annotation');
            error_log((string) $e);
        }
        $this->acl->removeAllow(null, ['Omeka\Api\Adapter\UserAdapter']);
    }
}

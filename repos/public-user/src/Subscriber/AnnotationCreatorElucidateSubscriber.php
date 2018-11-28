<?php

namespace PublicUser\Subscriber;

use Elucidate\Event\AnnotationLifecycleEvent;
use Omeka\Entity\User;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Zend\Uri\Uri;
use Zend\View\Helper\ServerUrl;

class AnnotationCreatorElucidateSubscriber implements EventSubscriberInterface
{
    private $user;

    /**
     * Returns an array of event names this subscriber wants to listen to.
     *
     * The array keys are event names and the value can be:
     *
     *  * The method name to call (priority defaults to 0)
     *  * An array composed of the method name to call and the priority
     *  * An array of arrays composed of the method names to call and respective
     *    priorities, or 0 if unset
     *
     * For instance:
     *
     *  * array('eventName' => 'methodName')
     *  * array('eventName' => array('methodName', $priority))
     *  * array('eventName' => array(array('methodName1', $priority), array('methodName2')))
     *
     * @return array The event names to listen to
     */
    public static function getSubscribedEvents()
    {
        return [
            AnnotationLifecycleEvent::PRE_UPDATE => 'addAnotherCreatorToAnnotation',
            AnnotationLifecycleEvent::PRE_CREATE => 'addCreatorToAnnotation',
        ];
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user)
    {
        $this->user = $user;
    }

    public function getServerUrl()
    {
        $helper = new ServerUrl();
        $url = $helper->__invoke(true);

        return new Uri($url);
    }

    public function userExists()
    {
        return (bool) $this->user;
    }

    public function addAnotherCreatorToAnnotation(AnnotationLifecycleEvent $event)
    {
        if (!$this->userExists()) {
            return;
        }

        $annotation = $event->annotationExists() ? $event->getAnnotation() : $event->getSubject();
        $user = $this->getUser();

        $creators = [];
        if ($annotation->creator) {
            $creators[] = [$annotation->creator];
        }

        if (!$annotation->creator || $annotation->creator['email_sha1'] !== sha1($user->getEmail())) {
            $creators[] = [
                'id' => $this->getServerUrl()->setPath('/admin/user/'.$user->getId())->toString(),
                'type' => 'Person',
                'name' => $user->getName(),
                'nickname' => $user->getName(),
                'email_sha1' => sha1($user->getEmail()),
            ];
        }

        $annotation->addMetaData([
            'creator' => $creators,
        ]);
    }

    public function addCreatorToAnnotation(AnnotationLifecycleEvent $event)
    {
        if (!$this->userExists()) {
            return;
        }

        $annotation = $event->annotationExists() ? $event->getAnnotation() : $event->getSubject();
        $user = $this->getUser();

        $annotation->addMetaData([
            'creator' => [
                'id' => $this->getServerUrl()->setPath('/admin/user/'.$user->getId())->toString(),
                'type' => 'Person',
                'name' => $user->getName(),
                'nickname' => $user->getName(),
                'email_sha1' => sha1($user->getEmail()),
            ],
        ]);
    }
}

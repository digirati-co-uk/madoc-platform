<?php

namespace ElucidateModule\Subscriber;

use DateTime;
use Elucidate\Event\AnnotationLifecycleEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CreatedTimestampSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
          AnnotationLifecycleEvent::PRE_CREATE => ['addTimestampToAnnotation'],
        ];
    }

    public function addTimestampToAnnotation(AnnotationLifecycleEvent $event)
    {
        $annotation = $event->getLatestAnnotation();

        if (!$annotation) {
            return;
        }

        if (null === $annotation->created) {
            $annotation->addMetaData([
                'created' => (new DateTime())->format(DateTime::ATOM),
            ]);
        }
    }
}

<?php

namespace ElucidateProxy\Subscriber;

use Elucidate\Event\AnnotationLifecycleEvent;
use Elucidate\Event\ContainerLifecycleEvent;
use Elucidate\Transform\UrlTransform;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Elucidate proxy subscriber.
 *
 * Finds URIs in the requested elucidate server and replaces those links
 * to a specified domain. The paths are not changed, but the domain and protocol are.
 *
 * This can be used to upgrade insecure connections to HTTPS.
 */
class ElucidateProxyUrlSubscriber implements EventSubscriberInterface
{
    private $uri;

    public function __construct(string $uri)
    {
        $this->uri = $uri;
    }

    public static function getSubscribedEvents()
    {
        return [
            // Annotations
            AnnotationLifecycleEvent::EMBEDDED_READ => 'replaceAnnotationUri',
            AnnotationLifecycleEvent::READ => 'replaceAnnotationUri',
            AnnotationLifecycleEvent::UPDATE => 'replaceAnnotationUri',
            AnnotationLifecycleEvent::CREATE => 'replaceAnnotationUri',

            // Containers
            ContainerLifecycleEvent::READ => 'replaceContainerUri',
            ContainerLifecycleEvent::UPDATE => 'replaceContainerUri',
            ContainerLifecycleEvent::CREATE => 'replaceContainerUri',
        ];
    }

    public function replaceAnnotationUri(AnnotationLifecycleEvent $e)
    {
        $annotation = $e->annotationExists() ? $e->getAnnotation() : $e->getSubject();
        $transform = new UrlTransform($this->uri);
        $newAnnotation = $transform->transformAnnotation($annotation);
        $e->setAnnotation($newAnnotation->withContainer($annotation->getContainer()));
    }

    public function replaceContainerUri(ContainerLifecycleEvent $e)
    {
        $annotation = $e->containerExists() ? $e->getContainer() : $e->getSubject();
        $transform = new UrlTransform($this->uri);
        $newContainer = $transform->transformContainer($annotation);
        $e->setContainer($newContainer);
    }
}

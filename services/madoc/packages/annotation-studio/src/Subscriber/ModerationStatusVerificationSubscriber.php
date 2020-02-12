<?php

namespace AnnotationStudio\Subscriber;

use Elucidate\Event\AnnotationLifecycleEvent;
use Elucidate\Model\Annotation;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use UnexpectedValueException;
use Zend\Uri\Uri;

class ModerationStatusVerificationSubscriber implements EventSubscriberInterface
{
    private $expectedStatus;
    private $currentSite;

    public function __construct(Uri $currentSite, string $expectedStatus)
    {
        $this->expectedStatus = $expectedStatus;
        $this->currentSite = $currentSite;
    }

    public static function getSubscribedEvents()
    {
        return [
            AnnotationLifecycleEvent::PRE_CREATE => 'verifyModerationStatus',
        ];
    }

    /**
     * @todo move to elucidate PHP
     *
     * @param Annotation $annotation
     * @return null|string
     */
    public function getGeneratorFromAnnotation(Annotation $annotation)
    {
        if (!$annotation['generator']) {
            return null;
        }
        if (is_array($annotation)) {
            return $this->getGeneratorFromAnnotation($annotation[0]);
        }
        if (is_string($annotation['generator'])) {
            return $annotation['generator'];
        }
        if (isset($annotation['id'])) {
            return $annotation['id'];
        }

        return null;
    }

    public function verifyModerationStatus(AnnotationLifecycleEvent $event)
    {
        $annotation = $event->annotationExists() ? $event->getAnnotation() : $event->getSubject();
        $generator = $this->getGeneratorFromAnnotation($annotation);
        if (!$generator) {
            return;
        }
        $generatorUrl = new Uri($generator);

        if (
            $this->currentSite->getHost() !== $generatorUrl->getHost() ||
            null === $generatorUrl->getPath()
        ) {
            return;
        }
        $uriPieces = explode('/', $generatorUrl->getPath());
        $generator = $uriPieces[2];
        if ('annotation-studio' !== strtolower($generator)) {
            return;
        }
        $moderationStatus = $uriPieces[3];
        // Here we actually stop the annotation from being sent.
        if (isset($moderationStatus) && $moderationStatus !== $this->expectedStatus) {
            $event->stopPropagation();
            $event->setArgument('exception', new UnexpectedValueException('Invalid capture model'));
        }
    }
}

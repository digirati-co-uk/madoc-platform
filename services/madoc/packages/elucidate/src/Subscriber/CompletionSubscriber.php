<?php

namespace ElucidateModule\Subscriber;

use Elucidate\ClientInterface;
use Elucidate\Model\Container;
use ElucidateModule\Mapping\AnnotationBuilder;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\Uri\Uri;

class CompletionSubscriber implements EventSubscriberInterface
{
    private $elucidate;
    private $elucidateEndpoint;

    const COMPLETION_MOTIVATION = 'https://digirati.com/ns/crowds#completed';

    public function __construct(string $elucidateEndpoint, ClientInterface $elucidate)
    {
        $this->elucidate = $elucidate;
        $this->elucidateEndpoint = $elucidateEndpoint;
    }

    public static function getSubscribedEvents()
    {
        return [
            'content.mark_as_complete' => ['markAsComplete'],
            'content.mark_as_incomplete' => ['markAsIncomplete'],
        ];
    }

    public function getIdFromSubject($subject)
    {
        return $this->elucidateEndpoint.md5($subject).'/';
    }

    public function ensureContainer($subject): Container
    {
        try {
            $container = $this->elucidate->getContainer($this->getIdFromSubject($subject));
        } catch (RequestException $e) {
            $container = $this->elucidate->createContainer(
                (new Container())->setHeaders([
                    'Slug' => md5($subject),
                ])
            );
        }

        return $container;
    }

    public function markAsIncomplete(GenericEvent $event)
    {
        $subject = $event->getSubject();
        $container = $this->ensureContainer($subject);

        if (0 === $container['total']) {
            // Already marked as incomplete
            return null;
        }

        $completed = $this->filterCompletedAnnotations($container['first']['items'] ?? []);

        foreach ($completed as $annotation) {
            $this->deleteAnnotation($container, $annotation);
        }
    }

    public function markAsComplete(GenericEvent $event)
    {
        $subject = $event->getSubject();
        $container = $this->ensureContainer($subject);
        $annotation = (new AnnotationBuilder())
            ->withSubject($subject)
            ->withContainer($container['id'])
            ->withMotivation(static::COMPLETION_MOTIVATION)
        ;

        $annotation = $this->elucidate->createAnnotation($annotation->build());

        $event->setArgument('annotation', $annotation['id']);
    }

    public function filterCompletedAnnotations($annotations): array
    {
        if (0 === count($annotations)) {
            return [];
        }

        return array_reduce($annotations, function ($completed, $next) {
            if ($next['motivation'] === static::COMPLETION_MOTIVATION) {
                array_push($completed, $next['id']);
            }

            return $completed;
        }, []);
    }

    public function deleteAnnotation($container, $annotation)
    {
        // We need the ETag.
        $annotation = $this->elucidate->getAnnotation($container, (new Uri($annotation))->getPath());

        // Grab all the headers (array of arrays)
        $headers = $annotation->getHeaders();
        if ($eTag = $this->getETag($headers)) {
            $headers['If-Match'] = $eTag;
        }

        // Delete with relative URL (temporary, see elucidate-php) and headers.
        $this->elucidate->deleteAnnotation($annotation->withRelativeId()->setHeaders($headers));
    }

    public function getETag($headers)
    {
        if (isset($headers['ETag'][0])) {
            return substr($headers['ETag'][0], 3, -1);
        }

        return null;
    }
}

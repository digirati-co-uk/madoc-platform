<?php

namespace ElucidateModule\Subscriber;

use Elucidate\ClientInterface;
use Elucidate\Model\Container;
use ElucidateModule\Mapping\AnnotationBuilder;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;

class BookmarkSubscriber implements EventSubscriberInterface
{
    private $elucidate;
    private $elucidateEndpoint;

    public function __construct(string $elucidateEndpoint, ClientInterface $elucidate)
    {
        $this->elucidate = $elucidate;
        $this->elucidateEndpoint = $elucidateEndpoint;
    }

    public static function getSubscribedEvents()
    {
        return [
            'iiif.bookmark' => ['importBookmark'],
        ];
    }

    public function getIdFromSubject($subject)
    {
        return $this->elucidateEndpoint.md5($subject).'/';
    }

    public function importBookmark(GenericEvent $event)
    {
        $subject = $event->getSubject();
        try {
            $container = $this->elucidate->getContainer($this->getIdFromSubject($subject));
        } catch (RequestException $e) {
            $container = $this->elucidate->createContainer(
                (new Container())->setHeaders([
                    'Slug' => md5($subject),
                ])
            );
        }

        $annotation = (new AnnotationBuilder())
            ->withSubject($subject)
            ->withContainer($container['id'])
            ->withMotivation('bookmarking')
        ;

        $annotation = $this->elucidate->createAnnotation($annotation->build());
        $event->setArgument('bookmark', $annotation['id']);
    }
}

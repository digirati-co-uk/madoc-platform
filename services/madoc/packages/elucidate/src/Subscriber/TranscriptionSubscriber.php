<?php

namespace ElucidateModule\Subscriber;

use Elucidate\ClientInterface;
use Elucidate\Model\Container;
use ElucidateModule\Mapping\AnnotationBuilder;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\Uri\Uri;

class TranscriptionSubscriber implements EventSubscriberInterface
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
            'content.transcription' => ['importTranscription'],
            'content.transcription_update' => ['updateTranscription'],
        ];
    }

    public function getIdFromSubject($subject)
    {
        return $this->elucidateEndpoint.md5($subject).'/';
    }

    public function relativeUrl(string $url)
    {
        $path = (new Uri($url))->getPath();
        $pieces = explode('/', $path);
        $id = array_pop($pieces);
        $container = array_pop($pieces);

        return $container.'/'.$id;
    }

    public function updateTranscription(GenericEvent $event)
    {
        $subject = $event->getSubject();
        $annotation = $this->elucidate->getAnnotation($this->getIdFromSubject($subject['subject']), $this->relativeUrl($subject['annotation']));
        $headers = $annotation->getHeaders();
        $eTag = substr($headers['ETag'][0] ?? '', 3, -1);
        $headers['If-Match'] = $eTag;
        $annotation->setHeaders($headers);
        $newAnnotation = $annotation->changeBody([
            'type' => ['TextualBody'],
            'format' => 'text/plain',
            'value' => $subject['transcription'],
        ]);

        $newAnnotation = $this->elucidate->updateAnnotation($newAnnotation);
        $event->setArgument('annotation', $newAnnotation['id']);
    }

    public function importTranscription(GenericEvent $event)
    {
        $subject = $event->getSubject();
        try {
            $container = $this->elucidate->getContainer($this->getIdFromSubject($subject['subject']));
        } catch (RequestException $e) {
            $container = $this->elucidate->createContainer(
                (new Container())->setHeaders([
                    'Slug' => md5($subject['subject']),
                ])
            );
        }

        $annotation = (new AnnotationBuilder())
            ->withSubject($subject['subject'])
            ->withTextualBody($subject['transcription'])
            ->withContainer($container)
            ->withMotivation('transcribing')
        ;

        if (isset($subject['part-of']) && $subject['part-of']) {
            $annotation->withSubjectPartOf($subject['part-of']);
        }

        $annotation = $this->elucidate->createAnnotation($annotation->build());
        $event->setArgument('annotation', $annotation['id']);
    }
}

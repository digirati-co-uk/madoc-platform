<?php

namespace IIIFStorage\Listener;

use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use Elucidate\Event\AnnotationLifecycleEvent;
use IIIFStorage\Repository\CanvasRepository;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class TargetStatusUpdateListener implements EventSubscriberInterface
{
    /**
     * The motivation for when the user intends to associate a "complete" state with the Target.
     */
    const CROWDS_MOTIVATION_COMPLETED = 'https://digirati.com/ns/crowds#completed';

    const CROWDS_MOTIVATION_DRAFTING = 'https://digirati.com/ns/crowds#drafting';

    /**
     * @var CanvasRepository
     */
    private $repository;


    public static function getSubscribedEvents()
    {
        return [
            AnnotationLifecycleEvent::PRE_CREATE => ['handleAnnotationPersistedEvent'],
            AnnotationLifecycleEvent::PRE_UPDATE => ['handleAnnotationPersistedEvent'],
            AnnotationLifecycleEvent::PRE_DELETE => ['handleAnnotationDeletedEvent'],
        ];
    }

    public function __construct(CanvasRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Handle {@code create}/{@code update} events and set the {@code completed} flag to true on the given Target.
     *
     * @param AnnotationLifecycleEvent $event
     */
    public function handleAnnotationPersistedEvent(AnnotationLifecycleEvent $event)
    {
        $this->handleAnnotationLifecycleEvent($event, false);
    }

    /**
     * Handle {@code delete} events and set the {@code completed} flag to {@code false} for the given target.
     *
     * @param AnnotationLifecycleEvent $event
     */
    public function handleAnnotationDeletedEvent(AnnotationLifecycleEvent $event)
    {
        $this->handleAnnotationLifecycleEvent($event, true);
    }

    public function getValue($data)
    {
        return $data[0]['@value'] ?? $data['@value'] ?? $data['@id'] ?? $data;
    }

    public function getTarget($annotation)
    {
        $target = $this->getValue($annotation['target']);
        if (isset($target['source'])) {
            $target = $target['source'];
        }
        if (isset($target['type']) && $target['type'] === 'Canvas') {
            $target = $target['id'];
        }
        return $target;
    }

    public function handleAnnotationLifecycleEvent(AnnotationLifecycleEvent $event, bool $isDelete)
    {
        $annotation = $event->getLatestAnnotation();
        $motivation = $this->getValue($annotation->motivation);
        $target = $this->getTarget($annotation);

        $this->repository->mutate(
            $this->getCanvasOmekaId($target),
            function (ItemRequest $itemRequest) use ($motivation, $isDelete) {
                $value = FieldValue::url(
                    'exif:versionInfo',
                    'Editorial status',
                    $motivation === static::CROWDS_MOTIVATION_COMPLETED
                        ? self::CROWDS_MOTIVATION_COMPLETED
                        : self::CROWDS_MOTIVATION_DRAFTING
                );


                if ($motivation === static::CROWDS_MOTIVATION_COMPLETED && $isDelete) {
                    $itemRequest->removeField('exif:versionInfo');
                    return;
                }

                if ($itemRequest->hasField('exif:versionInfo')) {
                    $itemRequest->overwriteSingleValue($value);
                } else {
                    $itemRequest->addField($value);
                }
            }
        );
    }

    public function getCanvasOmekaId(string $target): int
    {
        // @todo this is a nasty hack for changes to the ID field.
        //       taken from the Router in IIIF Storage.
        if (strpos($target, 'iiif/api') !== false) {
            $pieces = explode('/', array_shift(explode('?', $target)));
            $id = array_pop($pieces);
            if ($id) {
                return $id;
            }
        }

        $canvasMappings = $this->api->search(
            'items',
            [
                'resource_class_id' => $this->getResourceClassByTerm('sc:Canvas')->id(),
                'property' => [
                    [
                        'joiner' => 'and',
                        'property' => $this->loadPropertyId('dcterms:identifier'),
                        'type' => 'eq',
                        'text' => $target,
                    ]
                ]
            ]
        )->getContent();

        if (empty($canvasMappings)) {
            return null;
        }

        $canvasMapping = array_pop($canvasMappings);

        if (!$canvasMapping instanceof ItemRepresentation) {
            return null;
        }

        return $canvasMapping->id();
    }
}

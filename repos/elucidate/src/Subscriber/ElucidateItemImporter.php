<?php

namespace ElucidateModule\Subscriber;

use Elucidate\Event\AnnotationLifecycleEvent;
use Elucidate\Model\Annotation;
use ElucidateModule\Mapping\AnnotationMapper;
use ElucidateModule\Mapping\OmekaItemMapper;
use Digirati\OmekaShared\Helper\UrlHelper;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Throwable;

class ElucidateItemImporter implements EventSubscriberInterface
{
    private $mapper;
    private $annotationMapper;
    private $url;

    public function __construct(
        OmekaItemMapper $mapper = null,
        UrlHelper $url = null
    ) {
        $this->annotationMapper = new AnnotationMapper('annotation-studio', 'Dataset');
        $this->mapper = $mapper;
        $this->url = $url;
    }

    public function setUrl(UrlHelper $url)
    {
        $this->url = $url;

        return $this;
    }

    public static function getSubscribedEvents()
    {
        return [
            AnnotationLifecycleEvent::PRE_CREATE => [
                // Low priority so that validation and other transforms can happen.
                ['addItemToOmeka', -1000],
            ],
        ];
    }

    public function mapMultipleBodies(array $bodies = null)
    {
        if (null === $bodies) {
            return null;
        }
        $document = $this->annotationMapper->combineBodies($bodies);
        if (empty($document)) {
            return null;
        }

        $omekaFields = [];
        foreach ($document as $field => $value) {
            if ('@context' === $field) {
                continue;
            }
            $omekaFields[$field] = [$this->mapper->mapField($field, $value)];
        }

        if (empty($omekaFields)) {
            return null;
        }

        return $omekaFields;
    }

    public function importAnnotation(Annotation $annotation)
    {
        $bodies = $this->annotationMapper->getSerializedBodiesFromAnnotation($annotation);
        if (!$bodies) {
            return null;
        }
        $omekaFields = $this->mapMultipleBodies($bodies);

        if (null === $omekaFields) {
            return null;
        }

        $generators = $this->annotationMapper->extractGeneratorDetails($annotation);
        $captureModel = $this->annotationMapper->findCaptureModelFromGenerators($generators);
        $captureModelId = $this->annotationMapper->findCaptureModelIdFromGenerators($generators);
        $meta = $this->mapper->getClassTemplateFromCaptureModel($captureModelId);

        $resourceClass = $meta['resourceClass'];
        $resourceTemplate = $meta['resourceTemplate'];
        $labeledBy = $meta['labeledBy'] ?? null;
        $userId = null;
        $omekaItem = $this->mapper->makeItem(
            $omekaFields,
            $resourceClass,
            $resourceTemplate,
            $userId,
            $captureModel
        );
        // $labeledBy
        if (isset($omekaFields[$labeledBy][0]['@value'])) {
            $siteSlugLabel = urlencode(urldecode($omekaFields[$labeledBy][0]['@value']));
            $topicPages = [];
            foreach ($this->mapper->getAllSiteSlugs() as $slug) {
                $topicPages[] = $this->url->create('site/elucidate_absolute', [
                    'site-slug' => $slug,
                    'class' => strtolower($meta['resourceClassLabel']),
                    'id' => strtolower($siteSlugLabel),
                ], ['force_canonical' => true]);
            }

            $omekaItem = $this->mapper->addMainEntityOfPage(
                $siteSlugLabel,
                $omekaItem,
                $topicPages
            );
        }

        try {
            $response = $this->mapper->createItem($omekaItem);
        } catch (Throwable $e) {
            return null;
        }

        $item = $response->getContent();

        return json_decode(json_encode($item));
    }

    public function addItemToOmeka(AnnotationLifecycleEvent $event)
    {
        $annotation = $event->annotationExists() ? $event->getAnnotation() : $event->getSubject();
        $omekaItem = $this->importAnnotation($annotation);
        if ($omekaItem) {
            $event->stopPropagation();
            $event->preventPostProcess();

            $annotationLabel = $event->hasArgument('annotationLabel') ?
                $event->getArgument('annotationLabel') :
                ($omekaItem->{'dcterms:title'}[0]->{'@value'} ?? 'unknown');

            $annotationId = $event->hasArgument('annotationId') ?
                $event->getArgument('annotationId') :
                ($omekaItem->{'@id'} ?? '');

            $metaData = [
                'label' => $annotationLabel,
                'omekaItem' => true,
                'omekaItemSource' => json_encode($omekaItem),
            ];

            if (
                isset($omekaItem->{'schema:mainEntityOfPage'})
            ) {
                $mainEntity = $omekaItem->{'schema:mainEntityOfPage'};
                $url = isset($mainEntity->{'@id'}) ? ($mainEntity->{'@id'}) : (
                  isset($mainEntity[0]->{'@id'}) ? ($mainEntity[0]->{'@id'}) : null
                );
                if ($url) {
                    $metaData['canonicalUrl'] = $url;
                }
            }

            /** @var Annotation $newAnnotation */
            $newAnnotation = (new Annotation($annotationId))->withMetaData($metaData);
            $event->setAnnotation($newAnnotation);
        }
    }
}

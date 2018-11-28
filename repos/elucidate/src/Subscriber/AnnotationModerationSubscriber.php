<?php

namespace ElucidateModule\Subscriber;

use Elucidate\Event\AnnotationLifecycleEvent;
use ElucidateModule\Config\ElucidateModuleConfiguration;
use Digirati\OmekaShared\Helper\UrlHelper;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Zend\Uri\Uri;

class AnnotationModerationSubscriber implements EventSubscriberInterface
{
    const ANNOTATION_MOTIVATIONS = [
        'tagging',
        'commenting',
        'transcribing',
    ];
    /**
     * @var ElucidateModuleConfiguration
     */
    private $configuration;

    /**
     * @var Uri
     */
    private $generatorBaseUri;

    /**
     * @var UrlHelper
     */
    private $router;

    public function __construct(Uri $generatorBaseUri, UrlHelper $router, ElucidateModuleConfiguration $configuration)
    {
        $this->generatorBaseUri = $generatorBaseUri;
        $this->router = $router;
        $this->configuration = $configuration;
    }

    public static function getSubscribedEvents()
    {
        return [
            AnnotationLifecycleEvent::PRE_CREATE => ['onCreateAnnotation'],
        ];
    }

    public function onCreateAnnotation(AnnotationLifecycleEvent $event)
    {
        $annotation = $event->getLatestAnnotation();

        if (!$annotation ||
            !$this->configuration->isResourceModerationEnabled(ElucidateModuleConfiguration::RESOURCE_ANNOTATIONS)) {
            return;
        }

        if (in_array($annotation->motivation, static::ANNOTATION_MOTIVATIONS, true)) {
            $defaultStatus = $this->configuration->getDefaultModerationStatus($annotation->motivation);
            $generatorTag = (ElucidateModuleConfiguration::STATUS_APPROVED === $defaultStatus)
                ? 'moderated'
                : 'unmoderated';

            $generator = $this->router->create('annotation-studio-component',
                [
                    'component' => $annotation->motivation,
                    'moderation' => $generatorTag,
                ],
                [
                    'force_canonical' => false,
                    'uri' => $this->generatorBaseUri,
                ],
                true
            );

            $annotation->addMetaData([
                'generator' => $generator,
            ]);
        }
    }
}

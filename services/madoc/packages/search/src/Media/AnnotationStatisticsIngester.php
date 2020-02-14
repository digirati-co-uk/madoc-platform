<?php

namespace MadocSearch\Media;

use Digirati\OmekaShared\Framework\AbstractIngester;
use Omeka\Media\Ingester\IngesterInterface;
use Zend\Form\Element;

class AnnotationStatisticsIngester extends AbstractIngester implements IngesterInterface
{

    /**
     * @param string $operation either "create" or "update"
     * @return Element[]
     */
    public function getFormElements(string $operation): array
    {
        return [];
    }

    /**
     * Get a human-readable label for this ingester.
     *
     * @return string
     */
    public function getLabel()
    {
        return 'Annotation statistics';
    }

    /**
     * Get the name of the renderer for media ingested by this ingester
     *
     * @return string
     */
    public function getRenderer()
    {
        return 'annotation-statistics';
    }
}

<?php

namespace IIIFStorage\Aggregate;

use Digirati\OmekaShared\Model\FieldValue;
use IIIFStorage\Job\ImportCanvases;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use Omeka\Job\Dispatcher;

class ScheduleEmbeddedCanvases implements AggregateInterface
{
    /**
     * @var Dispatcher
     */
    private $dispatcher;
    /**
     * @var CheapOmekaRelationshipRequest
     */
    private $relationshipRequest;

    public function __construct(
        Dispatcher $dispatcher,
        CheapOmekaRelationshipRequest $relationshipRequest
    ) {
        $this->dispatcher = $dispatcher;
        $this->relationshipRequest = $relationshipRequest;
    }

    public $queue = [];
    public $canvases = [];
    public $prepared = [];

    public function mutate(ItemRequest $input)
    {
        $manifestJsonValues = $input->getValue('dcterms:source');
        foreach ($manifestJsonValues as $manifestJsonValue) {
            $id = md5($manifestJsonValue->getValue());
            $json = $this->queue[$id];
            if (isset($this->canvases[$id])) {
                $this->dispatcher->dispatch(
                    ImportCanvases::class,
                    [
                        'canvasList' => $this->canvases[$id],
                    ]
                );
            }
            // Remove sequences / canvases.
            unset($json['sequences']);
            // Save the json back, performance grounds, they are never used.
            $input->overwriteSingleValue(
                FieldValue::literal(
                    'dcterms:source',
                    'Manifest JSON',
                    json_encode($json)
                )
            );
        }
    }

    public function supports(ItemRequest $input)
    {
        return (
            $input->getResourceTemplateName() === 'IIIF Manifest' &&
            $input->hasField('dcterms:source')
        );
    }

    public function parse(ItemRequest $input)
    {
        $manifestJsonValues = $input->getValue('dcterms:source');
        foreach ($manifestJsonValues as $manifestJsonValue) {
            $parsed = json_decode($manifestJsonValue->getValue(), true);
            if ($parsed) {
                $this->queue[md5($manifestJsonValue->getValue())] = $parsed;
            }
        }
    }

    public function prepare()
    {
        foreach ($this->queue as $id => $manifest) {
            $manifestId = $manifest['@id'] ?? $manifest['id'];
            $firstSequenceCanvases = $manifest['sequences'][0]['canvases'] ?? $manifest['items'] ?? [];
            $this->canvases[$id] = [];
            foreach ($firstSequenceCanvases as $canvas) {
                $canvasId = $canvas['@id'] ?? $canvas['id'];
                if ($this->relationshipRequest->canvasExists($canvasId)) {
                    $this->canvases[$id][] = [
                        'type' => ImportCanvases::CANVAS_REFERENCE,
                        'manifestId' => $manifestId,
                        'id' => $canvasId,
                    ];
                } else {
                    // @todo check for existing canvases, make new list for assigning existing to this item set.
                    $canvas['partOf'] = [
                        'id' => $manifestId,
                        'type' => 'Manifest',
                    ];
                    $this->canvases[$id][] = $canvas;
                }
            }
        }
    }

    public function reset()
    {
        $this->queue = [];
    }
}

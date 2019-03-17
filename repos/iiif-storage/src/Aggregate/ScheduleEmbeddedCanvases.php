<?php

namespace IIIFStorage\Aggregate;

use IIIFStorage\Job\ImportCanvases;
use Digirati\OmekaShared\Model\ItemRequest;
use Omeka\Job\Dispatcher;

class ScheduleEmbeddedCanvases implements AggregateInterface
{
    /**
     * @var Dispatcher
     */
    private $dispatcher;

    public function __construct(Dispatcher $dispatcher)
    {
        $this->dispatcher = $dispatcher;
    }

    public $queue = [];
    public $canvases = [];
    public $prepared = [];

    public function mutate(ItemRequest $input)
    {
        $manifestJsonValues = $input->getValue('dcterms:source');
        foreach ($manifestJsonValues as $manifestJsonValue) {
            $id = md5($manifestJsonValue->getValue());
            if (isset($this->canvases[$id])) {
                $this->dispatcher->dispatch(
                    ImportCanvases::class,
                    [
                        'canvasList' => $this->canvases[$id],
                    ]
                );
            }
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

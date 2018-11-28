<?php

namespace IIIFStorage\Aggregate;


use IIIFStorage\Job\ImportManifests;
use IIIFStorage\Model\ItemRequest;
use Omeka\Job\Dispatcher;

class ScheduleEmbeddedManifests
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
    public $manifests = [];
    public $prepared = [];
    public $collectionIds = [];

    public function mutate(ItemRequest $input)
    {
        $collectionJsonValues = $input->getValue('dcterms:source');
        foreach ($collectionJsonValues as $collectionJsonValue) {
            $id = md5($collectionJsonValue->getValue());
            if (isset($this->manifests[$id])) {
                $this->dispatcher->dispatch(
                    ImportManifests::class,
                    [
                        'collection' => $this->collectionIds[$id],
                        'manifestList' => $this->manifests[$id]
                    ]
                );
            }
        }
    }

    public function supports(ItemRequest $input)
    {
        return (
            $input->getResourceTemplateName() === 'IIIF Collection' &&
            $input->hasField('dcterms:source')
        );
    }

    public function parse(ItemRequest $input)
    {
        $collectionJsonValues = $input->getValue('dcterms:source');
        foreach ($collectionJsonValues as $collectionJsonValue) {
            $parsed = json_decode($collectionJsonValue->getValue(), true);
            if ($parsed) {
                $this->queue[md5($collectionJsonValue->getValue())] = $parsed;
            }
        }
    }

    public function prepare()
    {
        foreach ($this->queue as $id => $collection) {
            $manifests = array_merge(
                [],
                array_filter(($collection['manifests'] ?? []), function($manifest) {
                    return $manifest['@type'] === 'sc:Manifest';
                }),
                array_filter(($collection['members'] ?? []), function($manifest) {
                    return $manifest['@type'] === 'sc:Manifest';
                })
            );

            $this->collectionIds[$id] = $collection['@id'];
            $this->manifests[$id] = [];
            foreach ($manifests as $manifest) {
                if ($manifest) {
                    $this->manifests[$id][] = $manifest;
                }
            }
        }
    }
}
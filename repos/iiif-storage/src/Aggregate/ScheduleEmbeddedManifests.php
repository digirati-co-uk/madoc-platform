<?php

namespace IIIFStorage\Aggregate;


use Digirati\OmekaShared\Model\FieldValue;
use IIIFStorage\Job\ImportManifests;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use Omeka\Job\Dispatcher;

class ScheduleEmbeddedManifests
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
    public $manifests = [];
    public $prepared = [];
    public $collectionIds = [];
    public $existingManifests = [];

    public function mutate(ItemRequest $input)
    {
        $collectionJsonValues = $input->getValue('dcterms:source');
        foreach ($collectionJsonValues as $collectionJsonValue) {
            $id = md5($collectionJsonValue->getValue());
            $json = $this->queue[$id];
            if (isset($this->manifests[$id])) {
                $this->dispatcher->dispatch(
                    ImportManifests::class,
                    [
                        'collection' => $this->collectionIds[$id],
                        'manifestList' => $this->manifests[$id]
                    ]
                );
            }
            // Remove manifests.
            unset($json['manifests']);
            unset($json['members']);
            // Save the json back, performance grounds, they are never used.
            $input->overwriteSingleValue(
                FieldValue::literal(
                    'dcterms:source',
                    'Collection JSON',
                    json_encode($json)
                )
            );
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
                    $manifestId = $manifest['@id'] ?? $manifest['id'];
                    if ($this->relationshipRequest->manifestExists($manifestId)) {
                        $this->manifests[$id][] = [
                            'type' => ImportManifests::MANIFEST_REFERENCE,
                            'id' => $manifestId,
                        ];
                    } else {
                        $this->manifests[$id][] = $manifest;
                    }
                }
            }
        }
    }
}

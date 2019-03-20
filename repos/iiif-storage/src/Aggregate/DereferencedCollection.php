<?php

namespace IIIFStorage\Aggregate;

use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use IIIFStorage\Utility\Translate;
use Omeka\Api\Exception\ValidationException;
use Zend\Http\Client;
use Zend\Http\Request;

class DereferencedCollection implements AggregateInterface
{
    use Translate;

    /**
     * @var array
     */
    private $collectionRequests = [];

    /**
     * @var array
     */
    private $collectionCache = [];

    /**
     * @var Client
     */
    private $client;
    /**
     * @var CheapOmekaRelationshipRequest
     */
    private $relationshipRequest;

    public function __construct(
        Client $client,
        CheapOmekaRelationshipRequest $relationshipRequest
    ) {
        $this->client = $client;
        $this->relationshipRequest = $relationshipRequest;
    }

    public function mutate(ItemRequest $input)
    {
        foreach ($input->getValue('dcterms:identifier') as $field) {
            $collectionUrl = $field->getId();
            if ($collectionUrl) {
                $json = $this->getCollection($collectionUrl);
                $collection = json_decode($json, true);
                $collectionId = $collection['@id'] ?? $collection['id'] ?? $collectionUrl;

                $input->addField(
                    FieldValue::literal(
                        'dcterms:source',
                        'Collection JSON',
                        $json
                    )
                );

                // Check if $json['@id'] !== $collectionUrl and update that field too.
                // @todo this could be optional, but that might be dangerous.
                if ($collectionId !== $collectionUrl) {
                    $input->overwriteSingleValue(
                        FieldValue::url(
                            'dcterms:identifier',
                            'Manifest URI',
                            $collectionId
                        )
                    );
                }

                /** @var FieldValue $title */
                $title = $input->getValue('dcterms:title');
                if (!$title || empty($title) || current($title)->getValue() === '') {
                    $label = $this->translate($collection['label'] ?? '');
                    if ($label) {
                        $input->addField(
                            FieldValue::literal('dcterms:title', 'Title', $label)
                        );
                    }
                }
            }
        }
    }

    public function supports(ItemRequest $input)
    {
        return (
            $input->getResourceTemplateName() === 'IIIF Collection' &&
            $input->hasField('dcterms:identifier')
        );
    }

    public function parse(ItemRequest $input)
    {
        foreach ($input->getValue('dcterms:identifier') as $field) {
            $collectionUrl = $field->getId();

            if ($collectionUrl) {
                $this->queueCollection($collectionUrl);
            }
        }
    }

    public function prepare()
    {
        foreach ($this->collectionRequests as $manifestUri) {
            $json = $this->getCollection($manifestUri);
            $collection = json_decode($json, true);
            $id = $collection['@id'] ?? $collection['id'] ?? null;
            $type = $collection['@type'] ?? $collection['type'] ?? null;
            if (
                strtolower($type) !== 'sc:collection' &&
                strtolower($type) !== 'collection'
            ) {
                throw new ValidationException('Resource is not a collection');
            }

            if ($this->relationshipRequest->collectionExists($id)) {
                $label = $this->translate($collection['label']);
                throw new ValidationException("$label already exists");
            }
        }
    }

    public function queueCollection($url)
    {
        if (!in_array($url, $this->collectionRequests)) {
            $this->collectionRequests[] = $url;
        }
    }

    public function getCollection($url, $retry = 5)
    {
        if (!isset($this->collectionCache[$url])) {
            try {
                $body = $this->client
                    ->send(
                        (new Request())
                            ->setUri($url)
                            ->setMethod('GET')
                    )
                    ->getBody();

                $this->collectionCache[$url] = (string)$body;
            } catch (\Throwable $e) {
                if ($retry > 0) {
                    return $this->getCollection($url, $retry - 1);
                }
            }
        }
        return $this->collectionCache[$url];
    }
}

<?php

namespace IIIFStorage\Aggregate;

use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\Utility\Translate;
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

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function mutate(ItemRequest $input)
    {
        foreach ($input->getValue('dcterms:identifier') as $field) {
            $collectionUrl = $field->getId();
            if ($collectionUrl) {
                $json = $this->getCollection($collectionUrl);
                $input->addField(
                    FieldValue::literal(
                        'dcterms:source',
                        'Collection JSON',
                        $json
                    )
                );

                /** @var FieldValue $title */
                $title = $input->getValue('dcterms:title');
                if (!$title || empty($title) || current($title)->getValue() === '') {
                    $collection = json_decode($json, true);

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
        foreach ($this->collectionRequests as $request) {
            $this->getCollection($request);
        }
        $this->collectionRequests = [];
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

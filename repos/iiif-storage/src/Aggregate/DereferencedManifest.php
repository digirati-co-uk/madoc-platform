<?php

namespace IIIFStorage\Aggregate;

use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\Utility\Translate;
use Zend\Http\Client;
use Zend\Http\Request;

class DereferencedManifest implements AggregateInterface
{
    use Translate;

    /**
     * @var array
     */
    private $manifestRequests = [];

    /**
     * @var array
     */
    private $manifestCache = [];

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
            $manifestUrl = $field->getId();
            if ($manifestUrl) {
                $json = $this->getManifest($manifestUrl);
                $input->addField(
                    FieldValue::literal(
                        'dcterms:source',
                        'Manifest JSON',
                        $json
                    )
                );

                $title = $input->getValue('dcterms:title');
                if (!$title || empty($title) || current($title)->getValue() === '') {
                    $manifest = json_decode($json, true);
                    $label = $this->translate($manifest['label'] ?? '');
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
            $input->getResourceTemplateName() === 'IIIF Manifest' &&
            $input->hasField('dcterms:identifier')
        );
    }

    public function parse(ItemRequest $input)
    {
        foreach ($input->getValue('dcterms:identifier') as $field) {
            $manifestUrl = $field->getId();

            if ($manifestUrl) {
                $this->queueManifest($manifestUrl);
            }
        }
    }

    public function prepare()
    {
        foreach ($this->manifestRequests as $request) {
            $this->getManifest($request);
        }
        $this->manifestRequests = [];
    }

    public function queueManifest($url)
    {
        if (!in_array($url, $this->manifestRequests)) {
            $this->manifestRequests[] = $url;
        }
    }

    public function getManifest($url, $retry = 5)
    {
        if (!isset($this->manifestCache[$url])) {
            try {
                $body = $this->client
                    ->send(
                        (new Request())
                            ->setUri($url)
                            ->setMethod('GET')
                    )
                    ->getBody();

                $this->manifestCache[$url] = (string) $body;
            } catch (\Throwable $e) {
                if ($retry > 0) {
                    return $this->getManifest($url, $retry - 1);
                }
            }
        }
        return $this->manifestCache[$url];
    }
}

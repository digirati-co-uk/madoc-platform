<?php

namespace IIIFStorage\Aggregate;

use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use IIIFStorage\Utility\Translate;
use Omeka\Api\Exception\ValidationException;
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
            $manifestUrl = $field->getId();
            if ($manifestUrl) {
                $json = $this->getManifest($manifestUrl);
                $manifest = json_decode($json, true);
                $manifestId = $manifest['@id'] ?? $manifest['id'] ?? $manifestUrl;
                $input->addField(
                    FieldValue::literal(
                        'dcterms:source',
                        'Manifest JSON',
                        $json
                    )
                );

                // Check if $json['@id'] !== $manifestUrl and update that field too.
                // @todo this could be optional, but that might be dangerous.
                if ($manifestId !== $manifestUrl) {
                    $input->overwriteSingleValue(
                        FieldValue::url(
                            'dcterms:identifier',
                            'Manifest URI',
                            $manifestId
                        )
                    );
                }

                $title = $input->getValue('dcterms:title');
                if (!$title || empty($title) || current($title)->getValue() === '') {
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
        foreach ($this->manifestRequests as $manifestUri) {
            $json = $this->getManifest($manifestUri);
            $manifest = json_decode($json, true);
            $id = $manifest['@id'] ?? $manifest['id'] ?? null;
            $type = $manifest['@type'] ?? $manifest['type'] ?? null;
            if (
                strtolower($type) !== 'sc:manifest' &&
                strtolower($type) !== 'manifest'
            ) {
                throw new ValidationException('Resource is not a manifest');
            }

            if ($this->relationshipRequest->manifestExists($id)) {
                $label = $this->translate($manifest['label']);
                throw new ValidationException("$label already exists");
            }
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
                throw new ValidationException('Could not fetch resource');
            }
        }
        return $this->manifestCache[$url];
    }
}

<?php

namespace ElucidateModule\Mapping;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\PropertyRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Api\Representation\ValueRepresentation;
use Throwable;

class OmekaItemMapper
{
    private $api;
    private $client;

    public function __construct(
        Manager $api,
        Client $client
    ) {
        $this->api = $api;

        $this->client = $client;
    }

    public function getResourceTemplateById(int $id = null)
    {
        if (!$id) {
            return null;
        }
        try {
            $results = $this->api->read('item_sets', $id);
            $result = $results->getContent();
        } catch (Throwable $e) {
            return null;
        }
        /** @var ItemSetRepresentation $result */
        $resourceTemplate = $result->getJsonLd();
        if (!isset($resourceTemplate['crowds:externalResourceModel'])) {
            return null;
        }
        /** @var ValueRepresentation[] $conformsTo */
        $conformsTo = $resourceTemplate['crowds:externalResourceModel'];
        if (!isset($conformsTo[0])) {
            return null;
        }

        return $conformsTo[0];
    }

    public function getAllSiteSlugs(): array
    {
        $sites = $this->api->search('sites');
        /** @var SiteRepresentation[] $sites */
        $sites = $sites->getContent();

        return array_map(function (SiteRepresentation $site) {
            return $site->slug();
        }, $sites);
    }

    public function getPropertyByName(string $property, string $defaultLabel = null)
    {
        try {
            $results = $this->api->search('properties', ['term' => $property]);
            $results = $results->getContent();
        } catch (Throwable $e) {
            return null;
        }
        if (!isset($results[0])) {
            return null;
        }
        /** @var PropertyRepresentation $property */
        $property = $results[0];

        $label = $property->label();
        $id = $property->id();
        if (null === $id) {
            return null;
        }

        return [
            'label' => $label,
            'id' => $id,
        ];
    }

    // o:resource_template
    public function mapResourceTemplate(int $template)
    {
        return ['o:id' => $template];
    }

    // o:resource_class
    public function mapResourceClass(int $class)
    {
        return ['o:id' => $class];
    }

    public function makeItem(
        array $fields,
        int $resourceClass = null,
        int $resourceTemplate = null,
        int $userId = null,
        string $uiComponent = null
    ) {
        if ($resourceClass) {
            $fields['o:resource_class'] = $this->mapResourceClass($resourceClass);
        }
        if ($resourceTemplate) {
            $fields['o:resource_template'] = $this->mapResourceTemplate($resourceTemplate);
        }
        if ($userId) {
            $fields['o:owner'] = ['o:id' => $userId];
        }
        if ($uiComponent) {
            $pieces = explode('/', $uiComponent);
            $label = ucfirst($pieces[count($pieces) - 2] ?? 'Component');

            $fields['crowds:uiComponent'] = [$this->mapField('crowds:uiComponent', $uiComponent, 'uri', null, $label)];
        }

        return $fields;
    }

    public function addMainEntityOfPage(string $label, array $fields, array $pages)
    {
        $fields['schema:mainEntityOfPage'] = array_map(function ($page) use ($label) {
            return $this->mapField('schema:mainEntityOfPage', $page, 'uri', null, $label);
        }, $pages);

        return $fields;
    }

    public function mapField($field, $value, $type = 'literal', $label = null, $oLabel = null)
    {
        if (!$value) {
            return null;
        }
        $property = $this->getPropertyByName($field, $label);
        if (null === $property) {
            return null;
        }
        $structure = [
            'type' => $type,
            'property_id' => $property['id'],
            'property_label' => $property['label'],
        ];
        if ('literal' === $type) {
            $structure['@value'] = $value;
        }
        if ('uri' === $type) {
            $structure['@id'] = $value;
        }

        if ($oLabel) {
            $structure['o:label'] = $oLabel;
        }

        return $structure;
    }

    public function getOmekaClassLabel($resourceClassUrl)
    {
        if (!$resourceClassUrl) {
            return null;
        }
        $resourceClassBody = $this->client->get($resourceClassUrl);
        $resourceClassBodyJson = json_decode($resourceClassBody->getBody(), true);

        return $resourceClassBodyJson['o:local_name'] ?? ($resourceClassBodyJson['o:label'] ?? null);
    }

    public function getClassTemplateFromCaptureModel(int $captureModel = null)
    {
        /** @var ValueRepresentation $captureModel */
        $captureModel = $this->getResourceTemplateById($captureModel);
        if (null === $captureModel) {
            return ['resourceClass' => null, 'resourceTemplate' => null];
        }
        $uri = $captureModel->uri() ? $captureModel->uri() : $captureModel->value();
        if (!$uri) {
            return ['resourceClass' => null, 'resourceTemplate' => null];
        }
        try {
            $captureModelContents = $this->client->get($uri);
        } catch (RequestException $e) {
            return ['resourceClass' => null, 'resourceTemplate' => null];
        }
        $json = json_decode($captureModelContents->getBody(), true);
        $resourceClass = $json['o:resource_class']['o:id'] ?? null;
        $resourceClassUrl = $json['o:resource_class']['@id'] ?? null;
        $classLabel = $this->getOmekaClassLabel($resourceClassUrl);
        $labeledBy = (string) $captureModel->resource()->value('crowds:derivedAnnoBodyLabelParts');

        return [
            'resourceClassLabel' => $classLabel,
            'resourceClass' => $resourceClass,
            'resourceTemplate' => $json['o:id'] ?? null,
            'labeledBy' => $labeledBy ?? null,
        ];
    }

    public function createItem($omekaItem)
    {
        return $this->api->create('items', $omekaItem);
    }
}

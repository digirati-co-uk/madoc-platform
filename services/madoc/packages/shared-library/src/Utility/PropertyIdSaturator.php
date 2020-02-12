<?php

namespace Digirati\OmekaShared\Utility;

use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use LogicException;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ResourceClassRepresentation;
use Omeka\Api\Representation\ResourceTemplateRepresentation;

class PropertyIdSaturator
{

    /**
     * @var Manager
     */
    private $api;

    /**
     * @var array
     */
    private $propertyIds = [];
    private $resourceTemplateNames = [];
    private $resourceClassNames = [];

    /**
     * @var ResourceTemplateRepresentation[]
     */
    private $resourceTemplateByName = [];

    /**
     * @var ResourceClassRepresentation[]
     */
    private $resourceClassByName = [];

    public function __construct(Manager $api)
    {
        $this->api = $api;
    }

    public function addResourceIds(ItemRequest $request)
    {
        // set resource template ID
        $resourceTemplateId = $request->getResourceTemplate();
        if ($resourceTemplateId) {
            $request->setResourceTemplateName(
                $this->loadResourceTemplateName($resourceTemplateId)
            );
        }

        $resourceClassId = $request->getResourceClass();
        if ($resourceClassId) {
            $request->setResourceClassName(
                $this->loadResourceClassName($resourceClassId)
            );
        }
    }

    public function getResourceClassByTerm(string $term)
    {
        if (!isset($this->resourceClassByName[$term])) {
            $response = $this->api
                ->search('resource_classes', [
                    'term' => $term
                ])
                ->getContent();

            if (empty($response)) {
                throw new LogicException("Invalid resource class term {$term}");
            }
            $this->resourceClassByName[$term] = array_pop($response);
        }
        return $this->resourceClassByName[$term];
    }

    public function getResourceTemplateByName(string $name)
    {
        if (!isset($this->resourceTemplateByName[$name])) {
            $response = $this->api
                ->search('resource_templates', [
                    'label' => $name
                ])
                ->getContent();

            if (empty($response)) {
                throw new LogicException("Invalid resource template name {$name}");
            }
            $this->resourceTemplateByName[$name] = array_pop($response);
        }
        return $this->resourceTemplateByName[$name];
    }

    public function addResourceTemplateByName(string $name, ItemRequest $itemRequest)
    {
        $resourceTemplate = $this->getResourceTemplateByName($name);
        $itemRequest->setResourceTemplate($resourceTemplate->id());
        $itemRequest->setResourceTemplateName($resourceTemplate->label());
        if ($resourceClass = $resourceTemplate->resourceClass()) {
            $itemRequest->setResourceClass($resourceClass->id());
            $itemRequest->setResourceClassName($resourceClass->label());
        }

        return $itemRequest;
    }

    public function addPropertyIds(ItemRequest $request)
    {
        $request->eachFieldValues([$this, 'addPropertyId']);
    }

    public function addPropertyId(FieldValue $value)
    {
        $value->setPropertyId($this->loadPropertyId($value->getTerm()));
    }

    public function loadResourceTemplateName($id)
    {
        if (!isset($this->resourceTemplateNames[$id])) {
            /** @var ResourceTemplateRepresentation $resourceTemplate */
            $resourceTemplate = $this->api
                ->read('resource_templates', $id)
                ->getContent();

            if (empty($resourceTemplate)) {
                throw new LogicException("Invalid resource template {$id}");
            }

            $this->resourceTemplateNames[$id] = $resourceTemplate->label();
            $resourceClass = $resourceTemplate->resourceClass();

            if ($resourceClass) {
                $this->resourceClassNames[$resourceClass->id()] = $resourceClass->label();
            }
        }
        return $this->resourceTemplateNames[$id];
    }


    public function loadResourceClassName($id)
    {
        if (!isset($this->resourceClassNames[$id])) {
            /** @var ResourceClassRepresentation $resourceClass */
            $resourceClass = $this->api
                ->read('resource_classes', $id)
                ->getContent();

            if (empty($resourceClass)) {
                throw new LogicException("Invalid resource class {$id}");
            }

            $this->resourceClassNames[$id] = $resourceClass->label();
        }
        return $this->resourceClassNames[$id];
    }

    public function loadPropertyId($term)
    {
        if (!isset($this->propertyIds[$term])) {
            $propertyRepresentationResponse = $this->api
                ->search('properties', [
                    'term' => $term
                ])
                ->getContent();

            if (empty($propertyRepresentationResponse)) {
                throw new LogicException("Invalid term {$term}, you may be missing a vocabulary");
            }

            $propertyRepresentation = array_pop($propertyRepresentationResponse);
            $this->propertyIds[$term] = $propertyRepresentation->id();
        }
        return $this->propertyIds[$term];
    }

}

<?php

namespace AnnotationStudio\CaptureModel;

use AnnotationStudio\OmekaItemExpander;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\PropertyRepresentation;
use Throwable;
use Zend\EventManager\EventManagerInterface;
use Zend\I18n\Translator\TranslatorInterface;
use Zend\Mvc\MvcEvent;

class CaptureModelRepository
{
    /**
     * @var Manager
     */
    private $api;
    /**
     * @var TranslatorInterface
     */
    private $translator;
    /**
     * @var Router
     */
    private $router;
    /**
     * @var string
     */
    private $siteId;

    public function __construct(
        Manager $api,
        Router $router,
        TranslatorInterface $translator = null
    ) {
        $this->api = $api;
        $this->translator = $translator;
        $this->router = $router;
    }
    
    public function setSiteId(string $id)
    {
        $this->siteId = $id;
        $this->router->setSiteId($id);
    }

    public function getPropertyByName(string $property)
    {
        try {
            /** @var PropertyRepresentation[] $response */
            $response = $this->api->search('properties', ['term' => $property])->getContent();

            if (empty($response)) {
                return null;
            }

            $property = array_shift($response);

            return $property->id();
        } catch (Throwable $e) {
            return null;
        }
    }

    public function getAllCaptureModels($component, $moderation, array $query = [])
    {
        $extra = array_map(function ($name) use ($query) {
            $property = $this->getPropertyByName($name);
            if (!$property) {
                return null;
            }

            return [
                'joiner' => 'and',
                'property' => $property,
                'type' => 'eq',
                'text' => $query[$name],
            ];
        }, array_keys($query));

        $searchQuery = [
            'resource_template_label' => 'Crowd Source Group',
            'property' => array_merge([
                [
                    'joiner' => 'and',
                    'property' => $this->getUiComponentFieldId(), // 1374,
                    'type' => 'eq',
                    'text' => $component,
                ],
            ], array_filter($extra)),
        ];

        if ($this->siteId) {
            $searchQuery['site_id'] = $this->siteId;
        }

        /** @var ItemSetRepresentation[] $content */
        $content = $this->api->search('item_sets', $searchQuery)->getContent();

        if (empty($content)) {
            return null;
        }

        return array_map(function (ItemSetRepresentation $document) use ($component, $moderation) {
            return $this->expandDocument(
                $this->findItemSet($document->id()), $component, $moderation
            );
        }, $content);
    }

    public function expandDocument($item, $component, $moderation)
    {
        return OmekaItemExpander::expandDocument($item, function ($id, $document) use ($component, $moderation) {
            if ($document instanceof ItemSetRepresentation) {
                return $this->router->model($id, $component, $moderation, !!$this->siteId);
            }

            return $document->apiUrl();
        }, $this->translator);
    }

    public function findItemSet($id)
    {
        $query = [];
        if ($this->siteId) {
            $query['site_id'] = $this->siteId;
        }
        $item = $this->api->read('item_sets', $id, $query);
        $content = $item->getContent();

        return $content;
    }

    public function getUiComponentFieldId()
    {
        return $this->getPropertyByName('crowds:uiComponent');
    }

    public function apiContextFromEventManager(EventManagerInterface $eventManager)
    {
        $args = $eventManager->prepareArgs(['context' => []]);
        $eventManager->triggerEvent(new MvcEvent('api.context', null, $args));
        if (isset($args['context']['xx'])) {
            $args['context']['oa'] = $args['context']['xx'];
            unset($args['context']['xx']);
        }

        return $args['context'];
    }
}

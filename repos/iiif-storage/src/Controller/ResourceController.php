<?php

namespace IIIFStorage\Controller;

use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use Omeka\Mvc\Exception\NotFoundException;
use Zend\Diactoros\Response\JsonResponse;

class ResourceController extends AbstractPsr7ActionController
{

    /**
     * @var ManifestRepository
     */
    private $manifests;
    /**
     * @var ManifestBuilder
     */
    private $manifestBuilder;
    /**
     * @var CanvasRepository
     */
    private $canvasRepository;
    /**
     * @var CanvasBuilder
     */
    private $canvasBuilder;
    /**
     * @var CollectionRepository
     */
    private $collections;
    /**
     * @var CollectionBuilder
     */
    private $collectionBuilder;

    public function __construct(
        ManifestRepository $manifests,
        ManifestBuilder $manifestBuilder,
        CanvasRepository $canvasRepository,
        CanvasBuilder $canvasBuilder,
        CollectionRepository $collections,
        CollectionBuilder $collectionBuilder
    ) {
        $this->manifests = $manifests;
        $this->manifestBuilder = $manifestBuilder;
        $this->canvasRepository = $canvasRepository;
        $this->canvasBuilder = $canvasBuilder;
        $this->collections = $collections;
        $this->collectionBuilder = $collectionBuilder;
        $this->allowCors();
    }

    public function manifestAction()
    {
        $id = $this->params()->fromRoute('manifest');
        try {
            $manifest = $this->manifests->getById($id);
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        // Item-set ID to manifest
        return new JsonResponse($this->manifestBuilder->build($manifest), 200, []);
    }

    public function canvasAction()
    {
        $id = $this->params()->fromRoute('canvas');
        try {
            $canvas = $this->canvasRepository->getById($id);
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        // Item ID to canvas
        return new JsonResponse($this->canvasBuilder->build($canvas));
    }

    public function collectionAction()
    {
        $id = $this->params()->fromRoute('collection');
        try {
            $collection = $this->collections->getById($id);
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        // Item-set ID to collection
        return new JsonResponse($this->collectionBuilder->build($collection));
    }

    public function siteCollectionAction()
    {
        // Site id (current site) to IIIF collection
        return new JsonResponse(['name' => 'Site collection action']);
    }

    public function imageServiceAction()
    {
        // Media ID -> image service
        return new JsonResponse(['name' => 'Image service action']);
    }

    public function setSiteId()
    {
        $siteId = $this->getCurrentSite();
        if ($siteId) {
            $this->manifestBuilder->setSiteId($siteId);
            $this->canvasBuilder->setSiteId($siteId);
            $this->canvasRepository->setSiteId($siteId);
            $this->manifests->setSiteId($siteId);
        }
    }

    public function getCurrentSite()
    {
        $site = $this->currentSite();
        return $site ? $site->id() : null;
    }
}
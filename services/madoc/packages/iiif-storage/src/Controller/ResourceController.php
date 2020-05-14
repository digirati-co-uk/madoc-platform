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
use Zend\Diactoros\Response;
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
        $originalId = $this->params()->fromRoute('original', false);

        // Web caching for manifests
        $eTag = $this->params()->fromHeader('If-None-Match');
        $freshETag = $this->manifests->getEtag((int)$id);
        if ($eTag && (int)$eTag->getFieldValue() === (int)$freshETag) {
            return new Response\EmptyResponse(304, [
                'ETag' => $freshETag,
                'Cache-Control' => 'public, max-age=3600'
            ]);
        }

        try {
            $manifest = $this->manifests->getById($id);
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        // Item-set ID to manifest
        return new JsonResponse($this->manifestBuilder->build($manifest, $originalId)->getJson(), 200, [
            'ETag' => $manifest->modified() ? $manifest->modified()->getTimestamp() : (new \DateTime())->getTimestamp(),
            'Cache-Control' => 'public, max-age=3600'
        ]);
    }

    public function canvasAction()
    {
        $id = $this->params()->fromRoute('canvas');
        $originalId = $this->params()->fromRoute('original', false);

        try {
            $canvas = $this->canvasRepository->getById($id);
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        // Item ID to canvas
        return new JsonResponse($this->canvasBuilder->build($canvas, $originalId)->getJson());
    }

    public function collectionAction()
    {
        $id = $this->params()->fromRoute('collection');
        $originalId = $this->params()->fromRoute('original', false);

        try {
            $collection = $this->collections->getById($id);
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        $buildCollection = $this->collectionBuilder->build($collection, $originalId);

        // Item-set ID to collection
        return new JsonResponse($buildCollection->getJson());
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

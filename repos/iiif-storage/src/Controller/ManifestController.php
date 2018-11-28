<?php

namespace IIIFStorage\Controller;


use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\Router;
use Omeka\Api\Exception\NotFoundException;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Zend\View\Model\ViewModel;

class ManifestController extends AbstractPsr7ActionController
{

    /**
     * @var ManifestRepository
     */
    private $repo;
    /**
     * @var ManifestBuilder
     */
    private $builder;
    /**
     * @var Router
     */
    private $router;
    /**
     * @var CollectionRepository
     */
    private $collectionRepo;
    /**
     * @var CollectionBuilder
     */
    private $collectionBuilder;
    /**
     * @var CanvasRepository
     */
    private $canvasRepository;
    /**
     * @var CanvasBuilder
     */
    private $canvasBuilder;

    public function __construct(
        ManifestRepository $repo,
        ManifestBuilder $builder,
        Router $router,
        CollectionRepository $collectionRepo,
        CollectionBuilder $collectionBuilder,
        CanvasRepository $canvasRepository,
        CanvasBuilder $canvasBuilder
    ) {
        $this->repo = $repo;
        $this->builder = $builder;
        $this->router = $router;
        $this->collectionRepo = $collectionRepo;
        $this->collectionBuilder = $collectionBuilder;
        $this->canvasRepository = $canvasRepository;
        $this->canvasBuilder = $canvasBuilder;
    }

    public function addCollectionToViewModel(array $vm, string $collectionId, string $manifestId) {
        if ($collectionId) {
            $collection = $this->collectionRepo->getById($collectionId);
            if (!$this->collectionRepo->containsManifest($collection, $manifestId)) {
                throw new NotFoundException();
            }
            $collectionRepresentation = $this->collectionBuilder->buildResource($collection);
            $vm['collection'] = $collectionRepresentation->getCollection();
            $vm['collectionResource'] = $collectionRepresentation;
        }
    }

    public function viewAction()
    {
        $manifestId = $this->params()->fromRoute('manifest');
        $collectionId = $this->params()->fromRoute('collection');

        $manifest = $this->repo->getById($manifestId);
        $manifestRepresentation = $this->builder->buildResource($manifest);

        $vm = [
            'manifest' => $manifestRepresentation->getManifest(),
            'resource' => $manifestRepresentation,
            'router' => $this->router,
            'media' => $manifest->media(),
            'renderMetadata' => empty(array_filter($manifest->media(), function(MediaRepresentation $media) {
                return $media->renderer() === 'iiif-metadata';
            }))
        ];

        if ($collectionId) {
            $this->addCollectionToViewModel($vm, $collectionId, $manifest->id());
        }

        return $this->render('iiif.manifest.view', $vm);
    }

    public function viewCanvasAction()
    {
        $canvasId = $this->params()->fromRoute('canvas');
        $manifestId = $this->params()->fromRoute('manifest');
        $collectionId = $this->params()->fromRoute('collection');

        $canvasRepresentation = $this->canvasRepository->getById($canvasId);
        $canvas = $this->canvasBuilder->buildResource($canvasRepresentation);

        $vm = [
            'router' => $this->router,
            'canvas' => $canvas->getCanvas(),
            'resource' => $canvas,
            'media' => $canvasRepresentation->media(),
            'canvasEncode' => base64_encode($canvas->getId()),
            'renderMetadata' => empty(array_filter($canvasRepresentation->media(), function(MediaRepresentation $media) {
                return $media->renderer() === 'iiif-metadata';
            }))
        ];


        if ($manifestId) {
            $manifest = $this->repo->getById($manifestId);
            if (!$this->repo->containsCanvas($manifest, $canvasId)) {
                throw new NotFoundException();
            }
            $manifestRepresentation = $this->builder->buildResource($manifest);
            $vm['manifest'] = $manifestRepresentation->getManifest();
            $vm['manifestResource'] = $manifestRepresentation;

            if ($collectionId) {
                $this->addCollectionToViewModel($vm, $collectionId, $manifest->id());
            }
        }

        return $this->render('iiif.canvas.view', $vm);
    }

    public function render($event, $variables)
    {
        $viewModel = new ViewModel();

        /** @var SiteRepresentation $site */
        $site = $this->currentSite();
        $viewModel->setVariable('site', $site);
        $viewModel->setVariable('slug', $site->slug());

        foreach ($variables as $k => $variable) {
            $viewModel->setVariable($k, $variable);
        }

        $variables['viewModel'] = $viewModel;
        $variables['request'] = $this->getRequest();

        $this
            ->getEventManager()
            ->trigger($event, null, $variables);

        return $viewModel;
    }
}

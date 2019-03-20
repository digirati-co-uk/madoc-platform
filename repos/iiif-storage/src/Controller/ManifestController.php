<?php

namespace IIIFStorage\Controller;


use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use Digirati\OmekaShared\Helper\SettingsHelper;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\ApiRouter;
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
    /**
     * @var SettingsHelper
     */
    private $settingsHelper;
    /**
     * @var ApiRouter
     */
    private $apiRouter;

    public function __construct(
        ManifestRepository $repo,
        ManifestBuilder $builder,
        Router $router,
        CollectionRepository $collectionRepo,
        CollectionBuilder $collectionBuilder,
        CanvasRepository $canvasRepository,
        CanvasBuilder $canvasBuilder,
        ApiRouter $apiRouter,
        SettingsHelper $settingsHelper
    ) {
        $this->repo = $repo;
        $this->builder = $builder;
        $this->router = $router;
        $this->collectionRepo = $collectionRepo;
        $this->collectionBuilder = $collectionBuilder;
        $this->canvasRepository = $canvasRepository;
        $this->canvasBuilder = $canvasBuilder;
        $this->settingsHelper = $settingsHelper;
        $this->apiRouter = $apiRouter;
    }

    public function addCollectionToViewModel(array $vm, string $collectionId, string $manifestId)
    {
        if ($collectionId) {
            if (!$this->collectionRepo->containsManifest((int)$collectionId, $manifestId)) {
                throw new NotFoundException();
            }
            $collection = $this->collectionRepo->getById($collectionId);
            $embeddedManifestsToLoad = 1;
            $embeddedManifestPage = 1;
            $embeddedCanvasesToLoadPerManifest = 0;
            $collectionRepresentation = $this->collectionBuilder->buildResource(
                $collection,
                $this->shouldUseOriginalIds(),
                $embeddedManifestPage,
                $embeddedManifestsToLoad,
                $embeddedCanvasesToLoadPerManifest
            );
            $vm['collection'] = $collectionRepresentation->getCollection();
            $vm['collectionResource'] = $collectionRepresentation;
        }
    }

    public function viewAction()
    {
        // Set up the API Router to use original IDs for this request.
        if ($this->settingsHelper->__invoke('original-ids', false)) {
            $this->apiRouter->useOriginalUrls();
        }

        $canvasesPerPage = 12;

        $manifestId = $this->params()->fromRoute('manifest');
        $collectionId = $this->params()->fromRoute('collection');

        $manifest = $this->repo->getById($manifestId);
        $manifestRepresentation = $this->builder->buildResource(
            $manifest,
            $this->shouldUseOriginalIds(),
            $this->params()->fromQuery('page') ?? 1,
            $canvasesPerPage
        );

        $vm = [
            'manifest' => $manifestRepresentation->getManifest(),
            'resource' => $manifestRepresentation,
            'router' => $this->router,
            'media' => $manifest->media(),
            'renderMetadata' => empty(array_filter($manifest->media(), function (MediaRepresentation $media) {
                return $media->renderer() === 'iiif-metadata';
            }))
        ];

        if ($collectionId) {
            $this->addCollectionToViewModel($vm, $collectionId, $manifest->id());
        }

        $viewModel = new ViewModel($vm);

        $this->paginateControls($viewModel, $manifestRepresentation->getTotalResults(), $canvasesPerPage);

        return $this->render('iiif.manifest.view', $viewModel->getVariables());
    }

    private function shouldUseOriginalIds(): bool
    {
        return $this->settingsHelper->__invoke('original-ids', false);
    }

    public function viewCanvasAction()
    {
        // Set up the API Router to use original IDs for this request.
        if ($this->shouldUseOriginalIds()) {
            $this->apiRouter->useOriginalUrls();
        }

        $canvasId = $this->params()->fromRoute('canvas');
        $manifestId = $this->params()->fromRoute('manifest');
        $collectionId = $this->params()->fromRoute('collection');

        $canvasRepresentation = $this->canvasRepository->getById($canvasId);
        $canvas = $this->canvasBuilder->buildResource($canvasRepresentation, $this->shouldUseOriginalIds());

        $nextPrev = $this->repo->getPreviousNext($manifestId, $canvasId);

        $vm = [
            'router' => $this->router,
            'canvas' => $canvas->getCanvas(),
            'resource' => $canvas,
            'media' => $canvasRepresentation->media(),
            'canvasEncode' => base64_encode($canvas->getId()),
            'renderMetadata' => empty(array_filter($canvasRepresentation->media(), function (MediaRepresentation $media) {
                return $media->renderer() === 'iiif-metadata';
            })),
            'next' => $nextPrev['next'][0] ?? null,
            'previous' => $nextPrev['previous'][0] ?? null,
        ];

        if ($manifestId) {
            $manifest = $this->repo->getById($manifestId);
            if (!$this->repo->containsCanvas($manifest->id(), $canvasId)) {
                throw new NotFoundException();
            }
            $canvasPage = 1;
            $canvasesToLoad = 1;
            $manifestRepresentation = $this->builder->buildResource(
                $manifest,
                $this->shouldUseOriginalIds(),
                $canvasPage,
                $canvasesToLoad
            );
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

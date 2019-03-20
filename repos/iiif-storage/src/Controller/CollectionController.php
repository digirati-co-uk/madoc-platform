<?php

namespace IIIFStorage\Controller;

use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use Digirati\OmekaShared\Helper\SettingsHelper;
use Omeka\Mvc\Exception\NotFoundException;
use Zend\View\Model\ViewModel;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Utility\ApiRouter;
use IIIFStorage\Utility\Router;

class CollectionController extends AbstractPsr7ActionController
{
    /**
     * @var CollectionRepository
     */
    private $repo;
    /**
     * @var CollectionBuilder
     */
    private $builder;
    /**
     * @var Router
     */
    private $router;
    /**
     * @var ApiRouter
     */
    private $apiRouter;
    /**
     * @var SettingsHelper
     */
    private $settingsHelper;

    public function __construct(
        CollectionRepository $repo,
        CollectionBuilder $builder,
        Router $router,
        ApiRouter $apiRouter,
        SettingsHelper $settingsHelper
    ) {
        $this->repo = $repo;
        $this->builder = $builder;
        $this->router = $router;
        $this->apiRouter = $apiRouter;
        $this->settingsHelper = $settingsHelper;
    }

    // @todo move this configuration.
    const PER_PAGE = 24;

    public function viewAction()
    {
        $this->repo->setSiteId($this->currentSite()->id());

        // Set up the API Router to use original IDs for this request.
        if ($this->shouldUseOriginalIds()) {
            $this->apiRouter->useOriginalUrls();
        }

        $id = $this->params()->fromRoute('collection');
        try {
            $collection = $this->repo->getById($id);
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        $collectionRepresentation = $this->builder->buildResource(
            $collection,
            $this->shouldUseOriginalIds(),
            $this->params()->fromQuery('page') ?? 1,
            self::PER_PAGE,
            1
        );
        $collectionObj = $collectionRepresentation->getCollection();
        $manifests = $collectionObj->getManifests();

        $viewModel = new ViewModel([
            'collection' => $collectionObj,
            'resource' => $collectionRepresentation,
            'manifests' => $manifests,
            'router' => $this->router,
        ]);

        $this->paginateControls($viewModel, $collectionRepresentation->getTotalResults(), self::PER_PAGE);

        if ($this->getRequest()->isXmlHttpRequest()) {
            $viewModel->setTerminal(true);
        }

        return $viewModel;
    }

    public function viewTopAction()
    {
        return 'View top-level collection';
    }

    public function listAction()
    {
        // Set up the API Router to use original IDs for this request.
        if ($this->shouldUseOriginalIds()) {
            $this->apiRouter->useOriginalUrls();
        }

        $this->repo->setSiteId($this->currentSite()->id());
        try {
            $omekaCollections = $this->repo->getAll();
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        $viewModel = new ViewModel([
            'router' => $this->router,
        ]);

        $this->paginate($viewModel, 'itemSets', $omekaCollections, 3);

        $collections = array_map(
            function($collection) {
                return $this->builder->buildResource(
                    $collection,
                    $this->shouldUseOriginalIds(),
                    0,
                    5,
                    1
                );
            }, $viewModel->getVariable('itemSets'));

        $viewModel->setVariable('collections', $collections);

        return $viewModel;
    }

    private function shouldUseOriginalIds(): bool
    {
        return $this->settingsHelper->__invoke('original-ids', false);
    }
}

<?php

namespace IIIFStorage\Controller;


use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Utility\Router;
use Omeka\Mvc\Exception\NotFoundException;
use Zend\View\Model\ViewModel;

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

    public function __construct(CollectionRepository $repo, CollectionBuilder $builder, Router $router)
    {
        $this->repo = $repo;
        $this->builder = $builder;
        $this->router = $router;
    }

    public function viewAction()
    {
        $this->repo->setSiteId($this->currentSite()->id());
        $id = $this->params()->fromRoute('collection');
        try {
            $collection = $this->repo->getById($id);
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }

        $collectionRepresentation = $this->builder->buildResource($collection);

        return new ViewModel([
            'collection' => $collectionRepresentation->getCollection(),
            'resource' => $this->builder->buildResource($collection),
            'router' => $this->router,
        ]);
    }

    public function viewTopAction()
    {
        return 'View top-level collection';
    }

    public function listAction()
    {
        $this->repo->setSiteId($this->currentSite()->id());
        try {
            $omekaCollections = $this->repo->getAll();
        } catch (\Throwable $e) {
            throw new NotFoundException();
        }
        $collections = array_map([$this->builder, 'buildResource'], $omekaCollections);
        return new ViewModel([
            'collections' => $collections,
            'router' => $this->router,
        ]);
    }
}

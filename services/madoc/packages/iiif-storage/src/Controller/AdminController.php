<?php


namespace IIIFStorage\Controller;


use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use IIIFStorage\Job\IngestCanvasThumbnail;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\Repository\CanvasRepository;
use Omeka\Job\Dispatcher;
use Omeka\Mvc\Controller\Plugin\Messenger;
use Zend\View\Model\ViewModel;

class AdminController extends AbstractPsr7ActionController
{
    /**
     * @var CanvasRepository
     */
    private $repo;
    /**
     * @var CanvasBuilder
     */
    private $builder;
    /**
     * @var Dispatcher
     */
    private $dispatcher;

    public function __construct(
        CanvasRepository $repo,
        CanvasBuilder $builder,
        Dispatcher $dispatcher
    ) {
        $this->repo = $repo;
        $this->builder = $builder;
        $this->dispatcher = $dispatcher;
    }


    public function canvasAdminAction()
    {
        $canvasId = (int)$this->params()->fromRoute('canvas');
        $canvasRepresentation = $this->repo->getById($canvasId);
        $canvas = $this->builder->buildResource(
            $this->repo->getById($canvasId)
        );


        return new ViewModel([
            'canvas' => $canvas->getCanvas(),
            'canvasResource' => $canvas,
            'canvasRepresentation' => $canvasRepresentation,
        ]);
    }

    public function ingestCanvasThumbnailAction()
    {
        $canvasId = (int)$this->params()->fromRoute('canvas');
        if ($this->getRequest()->isPost()) {
            // This ensures canvas exists.
            $this->repo->getById($canvasId);
            // Dispatch the job.
            $job = $this->dispatcher->dispatch(IngestCanvasThumbnail::class, [
                'canvasId' => $canvasId
            ]);
            // If we got it back immediately, redirect to its log.
            // @todo maybe enable this behind configuration, this will redirect to logs.
//            if ($job) {
//                sleep(1);
//                return $this->redirect()->toRoute('admin/id', [
//                    'id' => $job->getId(),
//                    'controller' => 'job',
//                    'action' => 'log'
//                ]);
//            }
            /** @var Messenger $messenger */
            $messenger = $this->messenger();
            $messenger->addSuccess('Thumbnail queued up, reload page in a moment to see.');
        }

        return $this->redirect()->toRoute('iiif-storage-admin/canvas-admin', [], [], true);
    }

}

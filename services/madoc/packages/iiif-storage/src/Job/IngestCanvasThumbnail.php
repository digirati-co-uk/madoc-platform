<?php


namespace IIIFStorage\Job;


use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use IIIFStorage\Aggregate\AddImageService;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\Repository\CanvasRepository;
use Omeka\Job\AbstractJob;
use Psr\Container\ContainerInterface;
use Zend\Log\Logger;

class IngestCanvasThumbnail extends AbstractJob
{
    /** @var CanvasRepository */
    private $repo;
    /** @var CanvasBuilder */
    private $builder;
    /** @var Logger */
    private $logger;
    /** @var AddImageService */
    private $imageService;
    /** @var PropertyIdSaturator */
    private $saturator;


    public function bootstrap(ContainerInterface $c)
    {
        $this->repo = $c->get(CanvasRepository::class);
        $this->builder = $c->get(CanvasBuilder::class);
        $this->logger = $c->get('Omeka\Logger');
        $this->imageService = $c->get(AddImageService::class);
        $this->saturator = $c->get(PropertyIdSaturator::class);
    }

    /**
     * Perform this job.
     */
    public function perform()
    {
        $this->bootstrap($this->getServiceLocator());
        // Omeka canvas id.
        $canvasId = (int) $this->getArg('canvasId');
        // Debug log.
        $this->logger->info("Job starting for $canvasId");

        $canvas = $this->repo->getById($canvasId);

        $this->logger->debug('>>', json_decode(json_encode($canvas), true));

        $item = ItemRequest::fromPost(json_decode(json_encode($canvas), true));

        $this->saturator->addPropertyIds($item);

        $resourceName = $this->saturator->loadResourceTemplateName($item->getResourceTemplate());
        if ($resourceName) {
            $item->setResourceClassName($resourceName);
        }

        $this->logger->info('Resource template name: ' . $item->getResourceTemplate());
        $this->logger->info('Canvas ' . ($item->hasField('dcterms:source') ? 'has source' : 'does not have source'));

        if ($this->imageService->supports($item)) {
            $this->logger->info("Image service adding is supported");
            // Run these sequentially for now, will become relevant when batching.
            $this->imageService->parse($item);
            $this->imageService->prepare();
            $this->imageService->mutate($item);
            // Finally update.
            $this->repo->update($canvas->id(), $item);
        } else {
            $this->logger->err("Image service adding is NOT supported, skipping.");
        }
    }
}

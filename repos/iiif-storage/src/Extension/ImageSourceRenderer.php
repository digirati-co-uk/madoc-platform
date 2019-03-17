<?php

namespace IIIFStorage\Extension;


use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\Router;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Media\Renderer\IIIF;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\EventManager\EventManagerAwareInterface;
use Zend\EventManager\EventManagerAwareTrait;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class ImageSourceRenderer extends IIIF implements EventManagerAwareInterface
{
    use EventManagerAwareTrait;

    /**
     * @var TwigRenderer
     */
    private $twig;
    /**
     * @var CanvasRepository
     */
    private $canvasRepository;
    /**
     * @var CanvasBuilder
     */
    private $canvasBuilder;
    /**
     * @var Router
     */
    private $router;
    /**
     * @var EventDispatcher
     */
    private $dispatcher;
    /**
     * @var ManifestBuilder
     */
    private $manifestBuilder;

    public function __construct(
        TwigRenderer $twig,
        CanvasRepository $canvasRepository,
        CanvasBuilder $canvasBuilder,
        ManifestBuilder $manifestBuilder,
        Router $router,
        EventDispatcher $dispatcher
    ) {
        $this->twig = $twig;
        $this->canvasRepository = $canvasRepository;
        $this->canvasBuilder = $canvasBuilder;
        $this->router = $router;
        $this->dispatcher = $dispatcher;
        $this->manifestBuilder = $manifestBuilder;
    }

    public function render(PhpRenderer $view, MediaRepresentation $media, array $options = [])
    {
        $item = $media->item();
        if ($item->resourceClass()->uri() === 'http://iiif.io/api/presentation/2#Canvas') {
            return $this->renderCanvas($media, $item, function () use ($view, $media, $options) {
                return parent::render($view, $media, $options);
            }, $options['context'] ?? []);
        }

        return parent::render($view, $media, $options);
    }

    public function renderCanvas(MediaRepresentation $image, ItemRepresentation $canvasRepresentation, callable $fallback, array $context = [])
    {
        try {
            $canvas = $this->canvasBuilder->buildResource($canvasRepresentation);

            $viewModel = new ViewModel(array_merge([
                'router' => $this->router,
                'canvas' => $canvas->getCanvas(),
                'resource' => $canvas,
            ], $context));


            $manifests = $this->canvasRepository->getManifests($canvasRepresentation);

            if (!empty($manifests)) {
                // @todo might be more than one manifest.
                $manifestRepresentation = array_shift($manifests);
                $manifest = $this->manifestBuilder->buildResource($manifestRepresentation);;
                $viewModel->setVariable('manifest', $manifest->getManifest());
                $viewModel->setVariable('manifestResource', $manifest);
            }

            $viewModel->setTemplate('iiif-storage/canvas/view-image');

            /** @var GenericEvent $event */
            $this->dispatcher->dispatch('iiif.canvas.view', new GenericEvent($canvas, ['viewModel' => $viewModel]));

            if (!$viewModel->getVariable('annotationStudio')) {
                return $fallback();
            }

            return $this->twig->render($viewModel);
        } catch (\Throwable $e) {
            return $fallback();
        }
    }
}

<?php

namespace IIIFStorage\Media;


use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Utility\Router;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Api\Representation\ValueRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class CanvasSnippetRenderer implements RendererInterface, TranslatableRenderer, MediaPageBlockDualRender
{
    use RenderMedia;

    /**
     * @var TwigRenderer
     */
    private $twig;
    /**
     * @var Manager
     */
    private $api;
    /**
     * @var CanvasBuilder
     */
    private $canvasBuilder;
    /**
     * @var Router
     */
    private $router;
    /**
     * @var CanvasRepository
     */
    private $canvasRepository;

    public function __construct(
        TwigRenderer $twig,
        Manager $api,
        CanvasBuilder $canvasBuilder,
        CanvasRepository $canvasRepository,
        Router $router
    )
    {
        $this->twig = $twig;
        $this->api = $api;
        $this->canvasBuilder = $canvasBuilder;
        $this->router = $router;
        $this->canvasRepository = $canvasRepository;
    }

    /**
     * Render the provided media.
     *
     * @param PhpRenderer $view
     * @param array $data
     * @param array $options
     * @return string
     */
    public function renderFromData(PhpRenderer $view, array $data, array $options = [])
    {
        if (!$data['canvas']) return '';

        /** @var ItemRepresentation $canvasRepresentation */
        $canvasRepresentation = $this->api->read('items', $data['canvas'])->getContent();
        if (!$canvasRepresentation) return '';

        try {
            $manifests = $this->canvasRepository->getManifests($canvasRepresentation);
            $manifestId = current($manifests);
        } catch (\Throwable $e) {
            $manifestId = null;
        }

        $canvas = $this->canvasBuilder->buildResource($canvasRepresentation);

        $vm = new ViewModel([
            'canvas' => $canvas->getCanvas(),
            'router' => $this->router,
            'resource' => $canvas,
            'manifest' => $manifestId,
        ]);

        $vm->setTemplate('iiif-storage/media/canvas-snippet');
        return $this->twig->render($vm);
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }

    public function getTranslatableFieldNames(): array
    {
        return ['label'];
    }
}

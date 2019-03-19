<?php

namespace IIIFStorage\Media;


use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\Router;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class CanvasListRenderer implements RendererInterface, MediaPageBlockDualRender
{
    use RenderMedia;

    /**
     * @var TwigRenderer
     */
    private $twig;
    /**
     * @var ManifestRepository
     */
    private $repo;
    /**
     * @var CanvasBuilder
     */
    private $builder;
    /**
     * @var Router
     */
    private $router;

    public function __construct(
        TwigRenderer $twig,
        CanvasRepository $repo,
        CanvasBuilder $builder,
        Router $router
    ) {
        $this->twig = $twig;
        $this->repo = $repo;
        $this->builder = $builder;
        $this->router = $router;
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
        $data = array_merge([
            'search_query' => '',
            'search_results' => 4,
            'search_fallback' => false,
        ], $data);

        // @todo original ids
        $data['canvases'] = array_map(function ($canvas) {
            $this->builder->buildResource($canvas, false);
        }, array_slice($this->repo->search($data['search_query']), 0, $data['search_results']));
        $data['router'] = $this->router;
        $vm = new ViewModel(array_merge([], $options, $data));
        $vm->setTemplate('iiif-storage/media/canvas-list');
        return $this->twig->render($vm);
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}

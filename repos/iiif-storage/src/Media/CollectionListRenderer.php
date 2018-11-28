<?php

namespace IIIFStorage\Media;


use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Utility\Router;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class CollectionListRenderer implements RendererInterface, MediaPageBlockDualRender
{
    use RenderMedia;

    /**
     * @var TwigRenderer
     */
    private $twig;
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

    public function __construct(
        TwigRenderer $twig,
        CollectionRepository $repo,
        CollectionBuilder $builder,
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

        $data['collections'] = array_map([$this->builder, 'buildResource'], array_slice($this->repo->search($data['search_query']), 0, $data['search_results']));
        $data['router'] = $this->router;
        $vm = new ViewModel(array_merge([], $options, $data));
        $vm->setTemplate('iiif-storage/media/collection-list');
        return $this->twig->render($vm);
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}

<?php

namespace IIIFStorage\Media;


use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\Utility\Router;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class CollectionSnippetRenderer implements RendererInterface, MediaPageBlockDualRender
{
    use RenderMedia;

    /**
     * @var TwigRenderer
     */
    private $twig;
    /**
     * @var CollectionBuilder
     */
    private $collectionBuilder;
    /**
     * @var Router
     */
    private $router;
    /**
     * @var Manager
     */
    private $api;

    public function __construct(
        TwigRenderer $twig,
        Manager $api,
        CollectionBuilder $collectionBuilder,
        Router $router
    ) {
        $this->twig = $twig;
        $this->collectionBuilder = $collectionBuilder;
        $this->router = $router;
        $this->api = $api;
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
        if (!$data['collection']) return '';

        /** @var ItemSetRepresentation $canvasRepresentation */
        $collectionRepresentation = $this->api->read('item_sets', $data['collection'])->getContent();
        if (!$collectionRepresentation) return '';
        $manifestsToShow = $data['manifestsToShow'] ?? 4;

        // @todo original ids
        $collection = $this->collectionBuilder->buildResource(
            $collectionRepresentation,
            false,
            0,
            $manifestsToShow,
            1
        );

        $vm = new ViewModel([
            'manifestsToShow' => $data['manifestsToShow'] ?? 4,
            'collection' => $collection->getCollection(),
            'router' => $this->router,
            'resource' => $collection,
        ]);

        $vm->setTemplate('iiif-storage/media/collection-snippet');
        return $this->twig->render($vm);
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}

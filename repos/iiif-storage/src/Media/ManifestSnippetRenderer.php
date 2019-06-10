<?php

namespace IIIFStorage\Media;


use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\Router;
use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class ManifestSnippetRenderer implements RendererInterface, MediaPageBlockDualRender
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
     * @var ManifestBuilder
     */
    private $manifestBuilder;
    /**
     * @var Router
     */
    private $router;
    /**
     * @var ManifestRepository
     */
    private $manifestRepository;

    public function __construct(
        TwigRenderer $twig,
        Manager $api,
        ManifestBuilder $manifestBuilder,
        ManifestRepository $manifestRepository,
        Router $router
    ) {
        $this->twig = $twig;
        $this->api = $api;
        $this->manifestBuilder = $manifestBuilder;
        $this->router = $router;
        $this->manifestRepository = $manifestRepository;
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
        if (!$data['manifest']) return '';

        /** @var ItemRepresentation $manifestRepresentation */
        $manifestRepresentation = $this->api->read('items', $data['manifest'])->getContent();
        if (!$manifestRepresentation) return '';

        // @todo original ids
        $manifest = $this->manifestBuilder->buildResource(
            $manifestRepresentation,
            false,
            0,
            6
        );

        try {
            $collections = $this->manifestRepository->getCollections((int)$manifestRepresentation->id());
            $collectionId = current($collections->getList());
        } catch (\Throwable $e) {
            $collectionId = null;
        }

        $vm = new ViewModel([
            'collection' => $collectionId,
            'manifest' => $manifest->getManifest(),
            'router' => $this->router,
            'resource' => $manifest,
            'totalCanvases' => $this->manifestRepository->getTotalCanvases((int)$manifestRepresentation->id()),
        ]);

        $vm->setTemplate('iiif-storage/media/manifest-snippet-carousel');
        return $this->twig->render($vm);
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}

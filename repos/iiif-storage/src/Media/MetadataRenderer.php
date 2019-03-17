<?php

namespace IIIFStorage\Media;


use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class MetadataRenderer implements RendererInterface
{

    /**
     * @var TwigRenderer
     */
    private $twig;
    /**
     * @var ManifestBuilder
     */
    private $manifestBuilder;
    /**
     * @var CanvasBuilder
     */
    private $canvasBuilder;
    /**
     * @var CollectionBuilder
     */
    private $collectionBuilder;

    public function __construct(
        TwigRenderer $twig,
        ManifestBuilder $manifestBuilder,
        CanvasBuilder $canvasBuilder,
        CollectionBuilder $collectionBuilder
    ) {
        $this->twig = $twig;
        $this->manifestBuilder = $manifestBuilder;
        $this->canvasBuilder = $canvasBuilder;
        $this->collectionBuilder = $collectionBuilder;
    }

    /**
     * @param ItemRepresentation|ItemSetRepresentation $item
     * @param array $data
     * @return string|null
     */
    public function renderItem($item, array $data = [])
    {
        $data = array_merge([
            'show_title' => true,
            'show_summary' => true,
            'show_required' => true,
            'show_metadata_pairs' => true,
        ], $data);

        $resource = $this->buildResource($item);

        if (!$resource) {
            return '';
        }

        $vm = new ViewModel([
            'label' => $data['show_title'] ? $this->translate($resource->getLabel()) : null,
            'summary' => $data['show_summary'] ? $this->translate($resource->getDescription()) : null,
            'requiredStatement' => $data['show_required'] ? $this->translate($resource->getAttribution()) : null,
            'metadata' => $data['show_metadata_pairs'] ? $this->translateMetadata($resource->getMetaData()) : null,
        ]);
        $vm->setTemplate('iiif-storage/media/metadata');
        return $this->twig->render($vm);
    }

    /**
     * @todo this needs to be implemented.
     * @param $objOrString
     * @return mixed
     */
    private function translate($objOrString) {
        if (is_string($objOrString)) {
            return $objOrString;
        }
        foreach ($objOrString as $candidate) {
            if ($candidate['@language'] === 'en') {
                return $candidate['@value'];
            }
        }

        return $objOrString[0]['@value'] ?? '';
    }

    private function translateMetadata($metadata) {
        $newMetadata = [];
        foreach ($metadata as $pair) {
            $newMetadata[] = [
                'label' => $this->translate($pair['label']),
                'value' => $this->translate($pair['value']),
            ];
        }
        return $newMetadata;
    }

    /**
     * @param ItemRepresentation|ItemSetRepresentation $item
     * @return \IIIF\Model\Manifest|\IIIF\Model\Collection|\IIIF\Model\Canvas
     */
    public function buildResource($item)
    {
        $term = $item->resourceClass()->term();

        if ($term === 'sc:Collection') {
            $collectionResource = $this->collectionBuilder->buildResource($item);
            return $collectionResource->getCollection();
        }

        if ($term === 'sc:Manifest') {
            $manifestResource = $this->manifestBuilder->buildResource($item);
            return $manifestResource->getManifest();
        }

        if ($term === 'sc:Canvas') {
            $canvasResource = $this->canvasBuilder->buildResource($item);
            return $canvasResource->getCanvas();
        }

        return null;
    }

    /**
     * Render the provided media.
     *
     * @param PhpRenderer $view
     * @param MediaRepresentation $media
     * @param array $options
     * @return string
     */
    public function render(PhpRenderer $view, MediaRepresentation $media, array $options = [])
    {
        return $this->renderItem($media->item(), $media->mediaData());
    }
}

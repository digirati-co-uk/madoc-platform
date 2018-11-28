<?php

namespace IIIFStorage\Media;


use Omeka\Api\Exception\NotFoundException;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class BannerImageRenderer implements RendererInterface, MediaPageBlockDualRender
{
    use RenderMedia;

    /**
     * @var TwigRenderer
     */
    private $twig;

    public function __construct(
        TwigRenderer $twig
    )
    {
        $this->twig = $twig;
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
        $view->headScript()->appendFile($view->assetUrl('js/asset-form.js', 'Omeka'));
        $vm = new ViewModel([
            'banner_image' => $this->getBannerImage($view, $data['banner_image'])
        ]);

        $vm->setTemplate('iiif-storage/media/banner-image');
        return $this->twig->render($vm);
    }

    public function getBannerImage(PhpRenderer $view, string $id) {
        try {
            $response = $view->api()->read('assets', $id);
        } catch (NotFoundException $e) {
            return null;
        }

        return $response->getContent()->assetUrl();
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}
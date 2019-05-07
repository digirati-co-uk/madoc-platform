<?php

namespace IIIFStorage\Media;

use Digirati\OmekaShared\Helper\LocaleHelper;
use IIIFStorage\Utility\Router;
use Omeka\Api\Exception\NotFoundException;
use Omeka\Api\Manager;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class CrowdSourcingBannerRenderer implements RendererInterface, MediaPageBlockDualRender, LocalisedMedia, TranslatableRenderer
{
    use RenderMedia;

    /**
     * @var TwigRenderer
     */
    private $twig;
    /**
     * @var Router
     */
    private $router;
    /**
     * @var Manager
     */
    private $api;
    /**
     * @var LocaleHelper
     */
    private $localeHelper;

    public function __construct(
        TwigRenderer $twig,
        Manager $api,
        Router $router,
        LocaleHelper $localeHelper
    ) {
        $this->twig = $twig;
        $this->router = $router;
        $this->api = $api;
        $this->localeHelper = $localeHelper;
    }

    public function getBackgroundImage(string $id) {
        try {
            $response = $this->api->read('assets', $id);
        } catch (NotFoundException $e) {
            return null;
        }

        return $response->getContent()->assetUrl();
    }

    public function renderFromData(PhpRenderer $view, array $data, array $options = [])
    {
        $title = $data['title'] ?? 'Crowd sourcing platform';
        $text = $data['text'] ?? '';
        $subtitle = $data['subtitle'] ?? '';
        $subtext = $data['subtext'] ?? '';
        $background = $data['background'] ?? null;
        $collectionId = (int)$data['collection'] ?? null;
        $buttonText = (int)$data['button_text'] ?? null;
        $showButton = (bool)$data['show_button'] ?? null;

        $view->headScript()->appendFile($view->assetUrl('js/asset-form.js', 'Omeka'));

        $vm = new ViewModel([
            'title' => $title,
            'text' => $text,
            'subtitle' => $subtitle,
            'subtext' => $subtext,
            'background' => $this->getBackgroundImage($background),
            'collectionId' => $collectionId,
            'buttonText' => $buttonText,
            'showButton' => $showButton,
            'router' => $this->router,
        ]);
        $vm->setTemplate('iiif-storage/media/crowd-sourcing-banner');
        return $this->twig->render($vm);
    }

    public function getTranslatableFieldNames(): array
    {
        return [
            'title',
            'text',
            'subtitle',
            'subtext',
            'buttonText',
        ];
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }

    public function getLang(): string
    {
        return $this->localeHelper->getLocale();
    }
}

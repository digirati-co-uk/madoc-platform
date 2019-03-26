<?php

use Digirati\OmekaShared\Factory\EventDispatcherFactory;
use Digirati\OmekaShared\Factory\SettingsHelperFactory;
use Digirati\OmekaShared\Factory\UrlHelperFactory;
use Digirati\OmekaShared\Helper\SettingsHelper;
use Digirati\OmekaShared\Helper\UrlHelper;
use IIIFStorage\Aggregate\AddImageService;
use IIIFStorage\Aggregate\DereferencedCollection;
use IIIFStorage\Aggregate\DereferencedManifest;
use IIIFStorage\Aggregate\ScheduleEmbeddedCanvases;
use IIIFStorage\Aggregate\ScheduleEmbeddedManifests;
use IIIFStorage\Extension\ImageSourceRenderer;
use IIIFStorage\FieldFilters\HideCanvasJson;
use IIIFStorage\FieldFilters\HideManifestCollectionJson;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\JsonBuilder\ImageServiceBuilder;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Listener\ImportContentListener;
use IIIFStorage\Listener\TargetStatusUpdateListener;
use IIIFStorage\Listener\ViewContentListener;
use IIIFStorage\Media\BannerImageIngester;
use IIIFStorage\Media\BannerImageRenderer;
use IIIFStorage\Media\CanvasListIngester;
use IIIFStorage\Media\CanvasListRenderer;
use IIIFStorage\Media\CanvasSnippetIngester;
use IIIFStorage\Media\CanvasSnippetRenderer;
use IIIFStorage\Media\CollectionListIngester;
use IIIFStorage\Media\CollectionListRenderer;
use IIIFStorage\Media\CollectionSnippetIngester;
use IIIFStorage\Media\CollectionSnippetRenderer;
use IIIFStorage\Media\CrowdSourcingBannerIngester;
use IIIFStorage\Media\CrowdSourcingBannerRenderer;
use IIIFStorage\Media\LatestAnnotatedImagesIngester;
use IIIFStorage\Media\LatestAnnotatedImagesRenderer;
use IIIFStorage\Media\ManifestListIngester;
use IIIFStorage\Media\ManifestListRenderer;
use IIIFStorage\Media\ManifestSnippetIngester;
use IIIFStorage\Media\ManifestSnippetRenderer;
use IIIFStorage\Media\MetadataIngester;
use IIIFStorage\Media\MetadataRenderer;
use IIIFStorage\Media\PageBlockMediaAdapter;
use IIIFStorage\Media\TopContributorsIngester;
use IIIFStorage\Media\TopContributorsRenderer;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use IIIFStorage\Utility\ApiRouter;
use IIIFStorage\Utility\CheapOmekaRelationshipRequest;
use IIIFStorage\Utility\Router;
use IIIFStorage\ViewFilters\ChooseManifestTemplate;
use IIIFStorage\ViewFilters\DisableJsonField;
use Omeka\Job\Dispatcher;
use IIIFStorage\Media\IIIFImageIngester;
use Psr\Container\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Zend\Http\Client;
use Zend\Mvc\Plugin\FlashMessenger\FlashMessenger;

return [
    'service_manager' => [
        'factories' => [
            EventDispatcher::class => EventDispatcherFactory::class,
            UrlHelper::class => UrlHelperFactory::class,
            DereferencedManifest::class => function (ContainerInterface $c) {
                return new DereferencedManifest(
                    new Client(),
                    $c->get(CheapOmekaRelationshipRequest::class)
                );
            },
            DereferencedCollection::class => function (ContainerInterface $c) {
                return new DereferencedCollection(
                    new Client(),
                    $c->get(CheapOmekaRelationshipRequest::class)
                );
            },
            ImportContentListener::class => function (ContainerInterface $c) {
                return new ImportContentListener(
                    $c->get('Omeka\Logger'),
                    $c->get(PropertyIdSaturator::class),
                    [
                        $c->get(DereferencedManifest::class),
                        $c->get(ScheduleEmbeddedCanvases::class),
                        $c->get(AddImageService::class),
                        $c->get(DereferencedCollection::class),
                        $c->get(ScheduleEmbeddedManifests::class)
                    ],
                    new \Omeka\Mvc\Controller\Plugin\Messenger()
                );
            },
            TargetStatusUpdateListener::class => function (ContainerInterface $c) {
                return new TargetStatusUpdateListener(
                    $c->get(CanvasRepository::class),
                    $c->get('Omeka\ApiManager'),
                    $c->get(PropertyIdSaturator::class),
                    $c->get('Omeka\Acl')
                );
            },
            ViewContentListener::class => function (ContainerInterface $c) {
                return new ViewContentListener(
                    $c->get('Omeka\Logger'),
                    $c->get(ApiRouter::class),
                    $c->get(MetadataRenderer::class),
                    [
                        $c->get(DisableJsonField::class),
                        $c->get(ChooseManifestTemplate::class),
                    ],
                    [
                        $c->get(HideManifestCollectionJson::class),
                        $c->get(HideCanvasJson::class),
                    ]
                );
            },
            PropertyIdSaturator::class => function (ContainerInterface $c) {
                return new PropertyIdSaturator($c->get('Omeka\ApiManager'));
            },
            ScheduleEmbeddedCanvases::class => function (ContainerInterface $c) {
                return new ScheduleEmbeddedCanvases(
                    $c->get(Dispatcher::class),
                    $c->get(CheapOmekaRelationshipRequest::class)
                );
            },
            ScheduleEmbeddedManifests::class => function (ContainerInterface $c) {
                return new ScheduleEmbeddedManifests(
                    $c->get(Dispatcher::class),
                    $c->get(CheapOmekaRelationshipRequest::class)
                );
            },
            AddImageService::class => function (ContainerInterface $c) {
                return new AddImageService($c->get('Omeka\Logger'));
            },
            DisableJsonField::class => function (ContainerInterface $c) {
                return new DisableJsonField();
            },
            ChooseManifestTemplate::class => function (ContainerInterface $c) {
                return new ChooseManifestTemplate($c->get(PropertyIdSaturator::class));
            },
            HideManifestCollectionJson::class => function (ContainerInterface $c) {
                return new HideManifestCollectionJson();
            },
            HideCanvasJson::class => function (ContainerInterface $c) {
                return new HideCanvasJson();
            },
            ManifestRepository::class => function (ContainerInterface $c) {
                return new ManifestRepository(
                    $c->get('Omeka\ApiManager'),
                    $c->get(CanvasRepository::class),
                    $c->get(PropertyIdSaturator::class),
                    $c->get(CheapOmekaRelationshipRequest::class)
                );
            },
            CanvasRepository::class => function (ContainerInterface $c) {
                return new CanvasRepository(
                    $c->get('Omeka\ApiManager'),
                    $c->get(PropertyIdSaturator::class),
                    $c->get(CheapOmekaRelationshipRequest::class)
                );
            },
            CheapOmekaRelationshipRequest::class => function (ContainerInterface $c) {
                return new CheapOmekaRelationshipRequest(
                    $c->get('Omeka\Connection'),
                    $c->get(PropertyIdSaturator::class)
                );
            },
            CollectionRepository::class => function (ContainerInterface $c) {
                return new CollectionRepository(
                    $c->get('Omeka\ApiManager'),
                    $c->get(PropertyIdSaturator::class),
                    $c->get(CheapOmekaRelationshipRequest::class)
                );
            },
            ApiRouter::class => function (ContainerInterface $c) {
                return new ApiRouter($c->get(UrlHelper::class));
            },
            Router::class => function (ContainerInterface $c) {
                return new Router(
                    $c->get(UrlHelper::class),
                    $c->get(ManifestRepository::class),
                    $c->get(CollectionRepository::class),
                    $c->get(CanvasRepository::class)
                );
            },
            CanvasBuilder::class => function (ContainerInterface $c) {
                return new CanvasBuilder($c->get(ApiRouter::class), $c->get(ImageServiceBuilder::class));
            },
            ManifestBuilder::class => function (ContainerInterface $c) {
                return new ManifestBuilder(
                    $c->get(ApiRouter::class),
                    $c->get(ManifestRepository::class),
                    $c->get(CanvasBuilder::class)
                );
            },
            CollectionBuilder::class => function (ContainerInterface $c) {
                return new CollectionBuilder(
                    $c->get(ApiRouter::class),
                    $c->get(ManifestBuilder::class),
                    $c->get(ManifestRepository::class),
                    $c->get(CollectionRepository::class)
                );
            },
            ImageServiceBuilder::class => function (ContainerInterface $c) {
                return new ImageServiceBuilder($c->get(ApiRouter::class));
            },

            // Media
            BannerImageRenderer::class => function (ContainerInterface $c) {
                return new BannerImageRenderer($c->get('ZfcTwig\View\TwigRenderer'));
            },
            BannerImageIngester::class => function (ContainerInterface $c) {
                return new BannerImageIngester();
            },
            CanvasListIngester::class => function (ContainerInterface $c) {
                return new CanvasListIngester();
            },
            CanvasSnippetIngester::class => function (ContainerInterface $c) {
                return new CanvasSnippetIngester(
                    $c->get('Omeka\ApiManager'),
                    $c->get(PropertyIdSaturator::class),
                    $c->get(CheapOmekaRelationshipRequest::class)
                );
            },
            CollectionListIngester::class => function (ContainerInterface $c) {
                return new CollectionListIngester();
            },
            CollectionSnippetIngester::class => function (ContainerInterface $c) {
                return new CollectionSnippetIngester(
                    $c->get('Omeka\ApiManager'),
                    $c->get(PropertyIdSaturator::class)
                );
            },
            CrowdSourcingBannerIngester::class => function (ContainerInterface $c) {
                return new CrowdSourcingBannerIngester(
                    $c->get('Omeka\ApiManager')
                );
            },
            IIIFImageIngester::class => function (ContainerInterface $c) {
                /** @var \Omeka\Settings\Settings $settings */
                $settings = $c->get('Omeka\Settings');
                return new IIIFImageIngester(
                    $c->get('Omeka\HttpClient'),
                    $c->get('Omeka\File\Downloader'),
                    (int) $settings->get('iiif-storage_thumbnail-size', 256)
                );
            },
            LatestAnnotatedImagesIngester::class => function (ContainerInterface $c) {
                return new LatestAnnotatedImagesIngester();
            },
            TopContributorsIngester::class => function (ContainerInterface $c) {
                return new TopContributorsIngester();
            },
            ManifestListIngester::class => function (ContainerInterface $c) {
                return new ManifestListIngester();
            },
            ManifestSnippetIngester::class => function (ContainerInterface $c) {
                return new ManifestSnippetIngester(
                    $c->get('Omeka\ApiManager'),
                    $c->get(PropertyIdSaturator::class)
                );
            },
            MetadataIngester::class => function (ContainerInterface $c) {
                return new MetadataIngester();
            },
            ImageSourceRenderer::class => function (ContainerInterface $c) {
                return new ImageSourceRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get(CanvasRepository::class),
                    $c->get(CanvasBuilder::class),
                    $c->get(ManifestRepository::class),
                    $c->get(ManifestBuilder::class),
                    $c->get(Router::class),
                    $c->get(EventDispatcher::class),
                    $c->get(SettingsHelper::class)
                );
            },
            CanvasListRenderer::class => function (ContainerInterface $c) {
                return new CanvasListRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get(CanvasRepository::class),
                    $c->get(CanvasBuilder::class),
                    $c->get(Router::class)
                );
            },
            CanvasSnippetRenderer::class => function (ContainerInterface $c) {
                return new CanvasSnippetRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get('Omeka\ApiManager'),
                    $c->get(CanvasBuilder::class),
                    $c->get(CanvasRepository::class),
                    $c->get(Router::class)
                );
            },
            CollectionListRenderer::class => function (ContainerInterface $c) {
                return new CollectionListRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get(CollectionRepository::class),
                    $c->get(CollectionBuilder::class),
                    $c->get(Router::class)
                );
            },
            CollectionSnippetRenderer::class => function (ContainerInterface $c) {
                return new CollectionSnippetRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get('Omeka\ApiManager'),
                    $c->get(CollectionBuilder::class),
                    $c->get(Router::class)
                );
            },
            CrowdSourcingBannerRenderer::class => function (ContainerInterface $c) {
                return new CrowdSourcingBannerRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get('Omeka\ApiManager'),
                    $c->get(Router::class)
                );
            },
            LatestAnnotatedImagesRenderer::class => function (ContainerInterface $c) {
                return new LatestAnnotatedImagesRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get('Omeka\Connection'),
                    $c->get(CanvasRepository::class),
                    $c->get(CanvasBuilder::class),
                    $c->get(Router::class)
                );
            },
            TopContributorsRenderer::class => function (ContainerInterface $c) {
                return new TopContributorsRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get('Omeka\Connection'),
                    $c->get(Router::class)
                );
            },
            ManifestListRenderer::class => function (ContainerInterface $c) {
                return new ManifestListRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get(ManifestRepository::class),
                    $c->get(ManifestBuilder::class),
                    $c->get(Router::class)
                );
            },
            ManifestSnippetRenderer::class => function (ContainerInterface $c) {
                return new ManifestSnippetRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get('Omeka\ApiManager'),
                    $c->get(ManifestBuilder::class),
                    $c->get(ManifestRepository::class),
                    $c->get(Router::class)
                );
            },
            MetadataRenderer::class => function (ContainerInterface $c) {
                return new MetadataRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get(ManifestBuilder::class),
                    $c->get(CanvasBuilder::class),
                    $c->get(CollectionBuilder::class)
                );
            },
            SettingsHelper::class => SettingsHelperFactory::class,
        ]
    ],
    'view_helpers' => [
        'factories' => [
            'siteSetting' => function (ContainerInterface $c) {
                return $c->get(SettingsHelper::class);
            }
        ]
    ],
    'media_ingesters' => [
        'factories' => [
            'crowd-sourcing-banner' => function (ContainerInterface $c) {
                return $c->get(CrowdSourcingBannerIngester::class);
            },
            'iiif' => function (ContainerInterface $c) {
                return $c->get(IIIFImageIngester::class);
            },
            'iiif-banner-image' => function (ContainerInterface $c) {
                return $c->get(BannerImageIngester::class);
            },
            'iiif-canvas-list' => function (ContainerInterface $c) {
                return $c->get(CanvasListIngester::class);
            },
            'iiif-canvas-snippet' => function (ContainerInterface $c) {
                return $c->get(CanvasSnippetIngester::class);
            },
            'iiif-collection-list' => function (ContainerInterface $c) {
                return $c->get(CollectionListIngester::class);
            },
            'iiif-collection-snippet' => function (ContainerInterface $c) {
                return $c->get(CollectionSnippetIngester::class);
            },
            'iiif-manifest-list' => function (ContainerInterface $c) {
                return $c->get(ManifestListIngester::class);
            },
            'iiif-manifest-snippet' => function (ContainerInterface $c) {
                return $c->get(ManifestSnippetIngester::class);
            },
            'iiif-metadata' => function (ContainerInterface $c) {
                return $c->get(MetadataIngester::class);
            },
            'latest-annotated-images' => function (ContainerInterface $c) {
                return $c->get(LatestAnnotatedImagesIngester::class);
            },
            'top-contributors' => function (ContainerInterface $c) {
                return $c->get(TopContributorsIngester::class);
            },
        ],
    ],
    'media_renderers' => [
        'invokables' => [
            'iiif' => null,
        ],
        'factories' => [
            'crowd-sourcing-banner' => function (ContainerInterface $c) {
                return $c->get(CrowdSourcingBannerRenderer::class);
            },
            'iiif' => function (ContainerInterface $c) {
                return new ImageSourceRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer'),
                    $c->get(CanvasRepository::class),
                    $c->get(CanvasBuilder::class),
                    $c->get(ManifestRepository::class),
                    $c->get(ManifestBuilder::class),
                    $c->get(Router::class),
                    $c->get(EventDispatcher::class),
                    $c->get(SettingsHelper::class)
                );
            },
            'iiif-banner-image' => function (ContainerInterface $c) {
                return $c->get(BannerImageRenderer::class);
            },
            'iiif-canvas-list' => function (ContainerInterface $c) {
                return $c->get(CanvasListRenderer::class);
            },
            'iiif-canvas-snippet' => function (ContainerInterface $c) {
                return $c->get(CanvasSnippetRenderer::class);
            },
            'iiif-collection-list' => function (ContainerInterface $c) {
                return $c->get(CollectionListRenderer::class);
            },
            'iiif-collection-snippet' => function (ContainerInterface $c) {
                return $c->get(CollectionSnippetRenderer::class);
            },
            'iiif-manifest-list' => function (ContainerInterface $c) {
                return $c->get(ManifestListRenderer::class);
            },
            'iiif-manifest-snippet' => function (ContainerInterface $c) {
                return $c->get(ManifestSnippetRenderer::class);
            },
            'iiif-metadata' => function (ContainerInterface $c) {
                return $c->get(MetadataRenderer::class);
            },
            'latest-annotated-images' => function (ContainerInterface $c) {
                return $c->get(LatestAnnotatedImagesIngester::class);
            },
            'top-contributors' => function (ContainerInterface $c) {
                return $c->get(TopContributorsIngester::class);
            },
        ],
    ],
    'block_layouts' => [
        'factories' => [
            'crowd-sourcing-banner' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(CrowdSourcingBannerIngester::class),
                    $c->get(CrowdSourcingBannerRenderer::class)
                );
            },
            'iiif-banner-image' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(BannerImageIngester::class),
                    $c->get(BannerImageRenderer::class)
                );
            },
            'iiif-canvas-list' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(CanvasListIngester::class),
                    $c->get(CanvasListRenderer::class)
                );
            },
            'iiif-canvas-snippet' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(CanvasSnippetIngester::class),
                    $c->get(CanvasSnippetRenderer::class)
                );
            },
            'iiif-collection-list' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(CollectionListIngester::class),
                    $c->get(CollectionListRenderer::class)
                );
            },
            'iiif-collection-snippet' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(CollectionSnippetIngester::class),
                    $c->get(CollectionSnippetRenderer::class)
                );
            },
            'iiif-manifest-list' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(ManifestListIngester::class),
                    $c->get(ManifestListRenderer::class)
                );
            },
            'iiif-manifest-snippet' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(ManifestSnippetIngester::class),
                    $c->get(ManifestSnippetRenderer::class)
                );
            },
            'latest-annotated-images' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(LatestAnnotatedImagesIngester::class),
                    $c->get(LatestAnnotatedImagesRenderer::class)
                );
            },
            'top-contributors' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(TopContributorsIngester::class),
                    $c->get(TopContributorsRenderer::class)
                );
            },
        ],
    ],
    'navigation_links' => [
        'invokables' => [
            'manifest' => \IIIFStorage\Link\ManifestLink::class,
            'collection' => \IIIFStorage\Link\CollectionLink::class,
        ],
    ],
];

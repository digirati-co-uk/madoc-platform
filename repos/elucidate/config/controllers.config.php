<?php

use Elucidate\Client as ElucidateClient;
use ElucidateModule\Controller\CommentController;
use ElucidateModule\Controller\ActivityController;
use ElucidateModule\Controller\CompletionController;
use ElucidateModule\Controller\FlaggingController;
use ElucidateModule\Controller\ItemController;
use ElucidateModule\Controller\SearchController;
use ElucidateModule\Controller\TopicTypesController;
use ElucidateModule\Domain\ElucidateAnnotationMapper;
use ElucidateModule\Domain\Topics\TopicTypeRepository;
use ElucidateModule\Service\TacsiClient;
use ElucidateModule\Service\TopicFinder;
use Digirati\OmekaShared\Helper\UrlHelper;
use ElucidateModule\Subscriber\ElucidateItemImporter;
use Interop\Container\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcher;

return [
    'controllers' => [
        'factories' => [
            SearchController::class => function (ContainerInterface $c) {
                $config = $c->get('Omeka\Settings');

                return new SearchController(
                    $c->get('mathmos.guzzle'),
                    $c->get(ElucidateClient::class),
                    $c->get(ElucidateAnnotationMapper::class),
                    [
                        'search_uri' => $config->get('elucidate_search_search_uri'),
                        'search_https' => $config->get('elucidate_search_search_https'),
                        'search_by_id' => $config->get('elucidate_search_by_id'),
                    ]
                );
            },
            ImportAnnotationController::class => function (ContainerInterface $c) {
                return new ImportAnnotationController($c->get(ElucidateItemImporter::class));
            },
            FlaggingController::class => function (ContainerInterface $c) {
                return new FlaggingController(
                    $c->get(EventDispatcher::class)
                );
            },
            CompletionController::class => function (ContainerInterface $c) {
                return new CompletionController(
                    $c->get(EventDispatcher::class)
                );
            },
            CommentController::class => function (ContainerInterface $c) {
                return new CommentController(
                    $c->get(EventDispatcher::class)
                );
            },
            ActivityController::class => function (ContainerInterface $c) {
                $config = $c->get('Omeka\Settings');

                return new ActivityController(
                    $c->get(ElucidateClient::class),
                    $c->get(ElucidateAnnotationMapper::class),
                    [
                        'search_uri' => $config->get('elucidate_search_search_uri'),
                        'search_https' => $config->get('elucidate_search_search_https'),
                        'search_by_id' => $config->get('elucidate_search_by_id'),
                    ]
                );
            },
            ItemController::class => function (ContainerInterface $c) {
                $config = $c->get('Omeka\Settings');

                return new ItemController(
                    $c->get(ElucidateClient::class),
                    $c->get(ElucidateAnnotationMapper::class),
                    $c->get('Omeka\AuthenticationService'),
                    $c->get(UrlHelper::class),
                    [
                        'path' => $config->get('elucidate_item_endpoint'),
                        'field_name' => $config->get('elucidate_search_field_name'),
                        'field_is_property' => $config->get('elucidate_search_field_is_property'),
                        'search_using_class' => $config->get('elucidate_search_search_using_class'),
                        'has_virtual' => $config->get('elucidate_search_has_virtual'),
                        'virtual_prefix' => $config->get('elucidate_search_virtual_prefix'),
                        'search_uri' => $config->get('elucidate_search_search_uri'),
                        'search_https' => $config->get('elucidate_search_search_https'),
                        'search_by_id' => $config->get('elucidate_search_by_id'),
                        'search_using_uri' => $config->get('elucidate_search_using_uri'),
                        'topic_collection_uri' => $config->get('elucidate_topic_collection_uri'),
                        'universal_viewer_endpoint' => $config->get('iiif_view_uv_endpoint', 'https://universalviewer.io/uv.html'),
                    ],
                    $c->get('topic_types'),
                    $c->get(TopicTypeRepository::class)
                );
            },
            TopicTypesController::class => function (ContainerInterface $c) {
                return new TopicTypesController(
                    $c->get(TopicTypeRepository::class),
                    new TopicFinder($c->get(TacsiClient::class))
                );
            },
        ],
    ],
];

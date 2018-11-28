<?php

use ElucidateModule\Admin\ImportAnnotationController;
use ElucidateModule\Controller\CommentController;
use ElucidateModule\Controller\CompletionController;
use ElucidateModule\Controller\FlaggingController;
use ElucidateModule\Controller\ActivityController;
use ElucidateModule\Controller\ItemController;
use ElucidateModule\Controller\SearchController;
use ElucidateModule\Controller\TopicTypesController;

function siteRoutes($children)
{
    return [
        'type' => 'Segment',
        'options' => [
            'route' => '/s/:site-slug',
            'constraints' => [
                'site-slug' => '[a-zA-Z0-9_-]+',
            ],
            'defaults' => [
                '__NAMESPACE__' => 'Omeka\Controller\Site',
                '__SITE__' => true,
                'controller' => 'Index',
                'action' => 'index',
            ],
        ],
        'child_routes' => $children,
    ];
}

function segmentRoute(string $route, string $controller, string $action = 'index', array $constraints = [], $priority = null)
{
    return [
        'type' => 'Segment',
        'options' => [
            'route' => $route,
            'constraints' => $constraints,
            'defaults' => [
                '__NAMESPACE__' => '',
                'controller' => $controller,
                'action' => $action,
            ],
            'priority' => $priority,
        ],
    ];
}

return [
    'router' => [
        'routes' => [
            'service/mark-complete' => [
                'type' => 'literal',
                'may_terminate' => true,
                'options' => [
                    'route' => '/service/mark-complete',
                    'defaults' => [
                        '__NAMESPACE__' => '',
                        'controller' => CompletionController::class,
                        'action' => 'handleForm',
                    ],
                ],
            ],

            'site' => siteRoutes([
                'elucidate_flagging' => segmentRoute('/topics/flag', FlaggingController::class, 'form'),
                'elucidate_absolute' => segmentRoute('/page/topics/:class/:id', ItemController::class, 'view', [], -1),
                'elucidate_canvas_activity' => segmentRoute('/activity/canvas/:canvas', ActivityController::class, 'canvasActivity', []),
                'elucidate_user_activity' => segmentRoute('/activity/user/:user', ActivityController::class, 'userActivity', []),
                'elucidate_topic_types_index' => segmentRoute('/topic-types', TopicTypesController::class, 'index'),
                'elucidate_topic_types_view' => segmentRoute('/topic-types/:name', TopicTypesController::class, 'view'),
                'elucidate_search_results' => segmentRoute('/topics/search', SearchController::class, 'results'),
                'elucidate_create_topic' => segmentRoute('/topics/create', ItemController::class, 'createItem'),
                'service_comment' => [
                    'type' => 'literal',
                    'may_terminate' => true,
                    'options' => [
                        'route' => '/service/comment',
                        'defaults' => [
                            '__NAMESPACE__' => '',
                            'controller' => CommentController::class,
                            'action' => 'handleForm',
                        ],
                    ],
                ],
            ]),
            'admin' => [
                'child_routes' => [
                    'import-annotation' => [
                        'type' => 'literal',
                        'may_terminate' => true,
                        'options' => [
                            'route' => '/import-annotation',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => ImportAnnotationController::class,
                                'action' => 'form',
                            ],
                        ],
                    ],
                    'import-annotation-process' => [
                        'type' => 'literal',
                        'may_terminate' => true,
                        'options' => [
                            'route' => '/import-annotation/process',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => ImportAnnotationController::class,
                                'action' => 'process',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    'navigation' => [
        'AdminModule' => [
            [
                'label' => 'Import Annotation',
                'route' => 'admin/import-annotation',
                'resource' => ImportAnnotationController::class,
                'pages' => [
                    [
                        'label' => 'Import annotation',
                        'route' => 'admin/import-annotation',
                        'resource' => ImportAnnotationController::class,
                        'visible' => false,
                    ],
                    [
                        'label' => 'Process annotation',
                        'route' => 'admin/import-annotation/process',
                        'resource' => ImportAnnotationController::class,
                        'visible' => false,
                    ],
                ],
            ],
        ],
    ],
];

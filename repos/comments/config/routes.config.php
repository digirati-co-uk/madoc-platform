<?php

use Comments\Controller\CommentsController;

return [
    'router' => [
        'routes' => [
            [
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
                'child_routes' => [
                    'comments' => [
                        'type' => 'segment',
                        'may_terminate' => false,
                        'options' => [
                            'route' => '/comments',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => CommentsController::class,
                            ],
                        ],
                        'child_routes' => [
                            'get-container' => [
                                'type' => 'method',
                                'verb' => 'get',
                                'options' => [
                                    'verb' => 'GET',
                                    'defaults' => [
                                        'action' => 'viewComments',
                                    ],
                                ],
                            ],
                            'put-container' => [
                                'type' => 'method',
                                'options' => [
                                    'verb' => 'POST',
                                    'defaults' => [
                                        'action' => 'createComment',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];

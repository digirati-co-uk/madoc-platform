<?php

use Bookmarking\Controller\BookmarkController;

return [
    'router' => [
        'routes' => [
            'service-bookmark' => [
                'type' => 'literal',
                'may_terminate' => true,
                'options' => [
                    'route' => '/service/bookmark',
                    'defaults' => [
                        '__NAMESPACE__' => '',
                        'controller' => BookmarkController::class,
                        'action' => 'handleForm',
                    ],
                ],
            ],
        ],
    ],
];

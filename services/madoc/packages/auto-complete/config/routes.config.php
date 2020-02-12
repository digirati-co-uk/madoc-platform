<?php

use AutoComplete\Controller\CompletionController;

return [
    'router' => [
        'routes' => [
            'completion' => [
                'type' => 'segment',
                'options' => [
                    'route' => '/api/complete',
                    'defaults' => [
                        '__NAMESPACE__' => '',
                        'controller' => CompletionController::class,
                        'action' => 'completions',
                    ],
                ],
            ],
        ],
    ],
];

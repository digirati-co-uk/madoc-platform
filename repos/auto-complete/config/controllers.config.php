<?php

use AutoComplete\Completion\CompletionService;
use AutoComplete\Controller\CompletionController;

return [
    'controllers' => [
        'factories' => [
            CompletionController::class => function ($container) {
                return new CompletionController(
                    $container->get(CompletionService::class)
                );
            }
        ],
    ],
];

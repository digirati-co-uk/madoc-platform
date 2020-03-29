<?php

use MadocBridge\Controller\TemplateController;

return [
    'view_manager' => [
        'template_path_stack' => [
            realpath(__DIR__ . '/../view'),
        ],
    ],
    'service_manager' => [
        'factories' => [
            TemplateController::class => function () {
                return new TemplateController();
            },
        ]
    ],
    'router' => [
        'routes' => [
            'site' => [
                'child_routes' => [
                    'site-template' => [
                        'type' => 'Segment',
                        'options' => [
                            'route' => '/_template',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => TemplateController::class,
                                'action' => 'view',
                            ]
                        ],

                    ]
                ]
            ]
        ]
    ]
];

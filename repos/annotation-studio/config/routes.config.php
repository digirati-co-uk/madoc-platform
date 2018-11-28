<?php
use AnnotationStudio\Controller\CaptureModelController;

$annotationStudioRoutes = [
    'annotation-studio' => [
        'type' => 'segment',
        'options' => [
            'route' => '/annotation-studio',
            'defaults' => [
                '__NAMESPACE__' => '',
                'controller' => CaptureModelController::class,
            ],
        ],
        'child_routes' => [
            'component' => [
                'type' => 'segment',
                'options' => [
                    'route' => '/:moderation/:component',
                    'defaults' => ['action' => 'component'],
                ],
            ],
            'model' => [
                'type' => 'segment',
                'options' => [
                    'route' => '/:moderation/:component/:model',
                    'defaults' => ['action' => 'captureModel'],
                ],
            ],
        ],
    ],
];

return [
    'router' => [
        'routes' => array_merge([
            'site' => [
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
                'child_routes' => $annotationStudioRoutes,
            ],
        ], $annotationStudioRoutes),
    ],
];

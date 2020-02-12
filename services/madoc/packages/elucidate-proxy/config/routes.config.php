<?php

use ElucidateProxy\Controller\AnnotationController;
use ElucidateProxy\Controller\ContainerController;
use ElucidateProxy\Controller\ElucidateProxyController;

return [
    'router' => [
        'routes' => [
            // Create container.
            'elucidate-proxy-root' => [
                'type' => 'segment',
                'may_terminate' => false,
                'options' => [
                    'route' => '/annotation/w3c',
                    'defaults' => [
                        'type' => 'json',
                        '__NAMESPACE__' => '',
                        'controller' => ContainerController::class,
                    ],
                ],
                'child_routes' => [
                    'post-container' => [
                        'type' => 'method',
                        'options' => [
                            'verb' => 'POST',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'action' => 'postContainer',
                            ],
                        ],
                    ],
                ],
            ],

            // Container
            'elucidate-proxy-container' => [
                'type' => 'segment',
                'may_terminate' => false,
                'options' => [
                    'route' => '/annotation/w3c/:container',
                    'defaults' => [
                        '__NAMESPACE__' => '',
                        'controller' => ContainerController::class,
                    ],
                ],
                'child_routes' => [
                    'get-container' => [
                        'type' => 'method',
                        'verb' => 'get',
                        'options' => [
                            'verb' => 'GET',
                            'defaults' => [
                                'action' => 'getContainer',
                            ],
                        ],
                    ],
                    'options-container' => [
                        'type' => 'method',
                        'verb' => 'get',
                        'options' => [
                            'verb' => 'OPTIONS',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'action' => 'preflight',
                                'controller' => ElucidateProxyController::class,
                            ],
                        ],
                    ],
                    'put-container' => [
                        'type' => 'method',
                        'options' => [
                            'verb' => 'PUT',
                            'defaults' => [
                                'action' => 'putContainer',
                            ],
                        ],
                    ],
                    'delete-container' => [
                        'type' => 'method',
                        'options' => [
                            'verb' => 'DELETE',
                            'defaults' => [
                                'action' => 'deleteContainer',
                            ],
                        ],
                    ],

                    // Annotation
                    'post-annotation' => [
                        'type' => 'method',
                        'options' => [
                            'verb' => 'POST',
                            'defaults' => [
                                'controller' => AnnotationController::class,
                                'action' => 'postAnnotation',
                            ],
                        ],
                    ],
                ],
            ],

            // Annotation
            'elucidate-proxy-annotation' => [
                'type' => 'segment',
                'may_terminate' => false,
                'options' => [
                    'route' => '/annotation/w3c/:container/:annotation',
                    'defaults' => [
                        'type' => 'json',
                        '__NAMESPACE__' => '',
                        'controller' => AnnotationController::class,
                    ],
                ],
                'child_routes' => [
                    'get-annotation' => [
                        'type' => 'method',
                        'options' => [
                            'verb' => 'GET',
                            'defaults' => [
                                'action' => 'getAnnotation',
                            ],
                        ],
                    ],
                    'options-annotation' => [
                        'type' => 'method',
                        'verb' => 'get',
                        'options' => [
                            'verb' => 'OPTIONS',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'action' => 'preflight',
                                'controller' => ElucidateProxyController::class,
                            ],
                        ],
                    ],
                    'put-annotation' => [
                        'type' => 'method',
                        'options' => [
                            'verb' => 'PUT',
                            'defaults' => [
                                'action' => 'putAnnotation',
                            ],
                        ],
                    ],
                    'delete-annotation' => [
                        'type' => 'method',
                        'options' => [
                            'verb' => 'DELETE',
                            'defaults' => [
                                'action' => 'deleteAnnotation',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];

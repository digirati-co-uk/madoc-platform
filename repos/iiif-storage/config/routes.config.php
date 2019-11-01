<?php

use IIIFStorage\Controller\AdminController;
use IIIFStorage\Controller\CollectionController;
use IIIFStorage\Controller\ManifestController;
use IIIFStorage\Controller\PresleyController;
use IIIFStorage\Controller\ResourceController;

$iiifStorageRoutes = [
    'iiif-storage' => [
        'type' => 'segment',
        'options' => [
            'route' => '/iiif',
            'defaults' => [
                '__NAMESPACE__' => '',
                'controller' => ResourceController::class,
            ],
        ],
        'child_routes' => [
            'site-collection' => [
                'type' => 'segment',
                'options' => [
                    'route' => '/api/top',
                    'defaults' => ['action' => 'siteCollection'],
                ],
            ],

            'collection' => [
                'type' => 'segment',
                'options' => [
                    'constraints' => ['collection' => '[0-9]+'],
                    'route' => '/api/collection/:collection',
                    'defaults' => ['action' => 'collection'],
                ],
            ],

            'manifest' => [
                'type' => 'segment',
                'options' => [
                    'constraints' => ['manifest' => '[0-9]+'],
                    'route' => '/api/manifest/:manifest',
                    'defaults' => ['action' => 'manifest'],
                ],
            ],

            'canvas' => [
                'type' => 'segment',
                'options' => [
                    'constraints' => ['canvas' => '[0-9]+'],
                    'route' => '/api/canvas/:canvas',
                    'defaults' => ['action' => 'canvas'],
                ],
            ],

            'image-service' => [
                'type' => 'segment',
                'options' => [
                    'constraints' => ['image-service' => '[0-9]+'],
                    'route' => '/api/image-service/:image-service',
                    'defaults' => ['action' => 'imageService'],
                ],
            ],
            'original-site-collection' => [
                'type' => 'segment',
                'options' => [
                    'route' => '/api/original/top',
                    'defaults' => ['action' => 'siteCollection'],
                ],
            ],

            'original-collection' => [
                'type' => 'segment',
                'options' => [
                    'constraints' => ['collection' => '[0-9]+'],
                    'route' => '/api/original/collection/:collection',
                    'defaults' => ['action' => 'collection'],
                ],
            ],

            'original-manifest' => [
                'type' => 'segment',
                'options' => [
                    'constraints' => ['manifest' => '[0-9]+'],
                    'route' => '/api/original/manifest/:manifest',
                    'defaults' => ['action' => 'manifest', 'original' => true],
                ],
            ],

            'original-canvas' => [
                'type' => 'segment',
                'options' => [
                    'constraints' => ['canvas' => '[0-9]+'],
                    'route' => '/api/original/canvas/:canvas',
                    'defaults' => ['action' => 'canvas'],
                ],
            ],
        ]
    ],
];

return [
    'navigation' => [
        'AdminModule' => [
            [
                'label' => 'Create IIIF Collection', // @translate
                'class' => 'item-sets',
                'route' => 'admin/default',
                'controller' => 'item-set/add',
                'action' => '',
                'resource' => 'Omeka\Controller\Admin\ItemSet',
                'privilege' => 'browse',
                'query' => ['resource_template' => 'IIIF Collection']
            ],
            [
                'label' => 'Create IIIF Manifest', // @translate
                'class' => 'vocabularies',
                'route' => 'admin/default',
                'controller' => 'item/add',
                'action' => '',
                'resource' => 'Omeka\Controller\Admin\Item',
                'privilege' => 'browse',
                'query' => ['resource_template' => 'IIIF Manifest']
            ],
            [
                'label' => 'Create IIIF Canvas', // @translate
                'class' => 'resource-templates',
                'route' => 'admin/default',
                'controller' => 'item/add',
                'action' => '',
                'resource' => 'Omeka\Controller\Admin\Item',
                'privilege' => 'browse',
                'query' => ['resource_template' => 'IIIF Canvas']
            ],
        ],
    ],
    'router' => [
        'routes' => array_merge([
            'iiif-storage-admin' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/admin/iiif',
                ],
                'defaults' => [
                    '__NAMESPACE__' => '',
                    '__ADMIN__' => true,
                    'controller' => AdminController::class,
                ],
                'child_routes' => [
                    'canvas-admin' => [
                        'type' => 'segment',
                        'may_terminate' => true,
                        'options' => [
                            'route' => '/canvas/:canvas',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                '__ADMIN__' => true,
                                'action' => 'canvasAdmin',
                                'controller' => AdminController::class,
                            ],
                        ],
                        'child_routes' => [
                            'ingest-thumbnail' => [
                                'type' => 'segment',
                                'options' => [
                                    'route' => '/ingest-thumbnail',
                                    'defaults' => [
                                        '__NAMESPACE__' => '',
                                        '__ADMIN__' => true,
                                        'action' => 'ingestCanvasThumbnail',
                                        'controller' => AdminController::class,
                                    ],
                                ]
                            ],
                        ]
                    ],
                ]
            ],
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
                'child_routes' => array_merge([], $iiifStorageRoutes, [
                    'iiif-collection' => [
                        'type' => 'segment',
                        'options' => [
                            'route' => '/collections',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => CollectionController::class,
                                'action' => 'list',
                            ],
                        ],
                        'child_routes' => [
                            'all' => [
                                'type' => 'segment',
                                'options' => [
                                    'route' => '/all',
                                    'defaults' => ['action' => 'list',],
                                ]
                            ],
                            'view' => [
                                'type' => 'segment',
                                'options' => [
                                    'constraints' => ['collection' => '[0-9]+'],
                                    'route' => '/view/:collection',
                                    'defaults' => ['action' => 'view',],
                                ],
                            ],
                            'view-manifest' => [
                                'type' => 'segment',
                                'options' => [
                                    'constraints' => [
                                        'collection' => '[0-9]+',
                                        'manifest' => '[0-9]+',
                                    ],
                                    'route' => '/view/:collection/:manifest',
                                    'defaults' => [
                                        '__NAMESPACE__' => '',
                                        'controller' => ManifestController::class,
                                        'action' => 'view'
                                    ],
                                ],
                            ],
                            'view-canvas' => [
                                'type' => 'segment',
                                'options' => [
                                    'constraints' => [
                                        'collection' => '[0-9]+',
                                        'manifest' => '[0-9]+',
                                        'canvas' => '[0-9]+',
                                    ],
                                    'route' => '/view/:collection/:manifest/:canvas',
                                    'defaults' => [
                                        '__NAMESPACE__' => '',
                                        'controller' => ManifestController::class,
                                        'action' => 'viewCanvas'
                                    ],
                                ],
                            ],
                            'top' => [
                                'type' => 'segment',
                                'options' => [
                                    'constraints' => ['collection' => '[0-9]+'],
                                    'route' => '/top',
                                    'defaults' => ['action' => 'viewTop'],
                                ],
                            ],
                        ],
                    ],
                    'iiif-manifest' => [
                        'type' => 'segment',
                        'options' => [
                            'route' => '/manifests',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => ManifestController::class,
                                'action' => 'list',
                            ],
                        ],
                        'child_routes' => [
                            'view' => [
                                'type' => 'segment',
                                'options' => [
                                    'constraints' => ['manifest' => '[0-9]+'],
                                    'route' => '/view/:manifest',
                                    'defaults' => ['action' => 'view'],
                                ],
                            ],
                            'view-canvas' => [
                                'type' => 'segment',
                                'options' => [
                                    'constraints' => [
                                        'manifest' => '[0-9]+',
                                        'canvas' => '[0-9]+'
                                    ],
                                    'route' => '/view/:manifest/:canvas',
                                    'defaults' => ['action' => 'viewCanvas'],
                                ],
                            ],
                        ]
                    ],
                    'iiif-canvas' => [
                        'type' => 'segment',
                        'options' => [
                            'route' => '/canvases',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => ManifestController::class,
                                'action' => 'list',
                            ],
                        ],
                        'child_routes' => [
                            'view' => [
                                'type' => 'segment',
                                'options' => [
                                    'constraints' => ['canvas' => '[0-9]+'],
                                    'route' => '/view/:canvas',
                                    'defaults' => ['action' => 'viewCanvas'],
                                ],
                            ],
                        ]
                    ],
                ]),
            ],
            'presley-adapter' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/presley',
                    'defaults' => [
                        '__NAMESPACE__' => '',
                        'controller' => PresleyController::class,
                        'action' => 'getRootCollection',
                    ],
                ],
                'child_routes' => [
                    'root-collection' => [
                        'type' => 'segment',
                        'options' => [
                            'route' => '/collection',
                            'defaults' => ['action' => 'getRootCollection'],
                        ],
                    ],
                    'manifest-collection' => [
                        'type' => 'segment',
                        'options' => [
                            'route' => '/collection/:collection',
                            'defaults' => ['action' => 'getManifestsCollection']
                        ]
                    ],
                    'manifest-collection-contents' => [
                        'type' => 'segment',
                        'may_terminate' => false,
                        'options' => [
                            'verb' => 'POST',
                            'route' => '/collection/:collection/manifest',
                            'defaults' => [
                                'type' => 'json',
                            ]
                        ],
                        'child_routes' => [
                            'create' => [
                                'type' => 'method',
                                'options' => [
                                    'verb' => 'POST,OPTIONS',
                                    'defaults' => [
                                        'action' => 'addManifestToCollection'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ], $iiifStorageRoutes),
    ]
];

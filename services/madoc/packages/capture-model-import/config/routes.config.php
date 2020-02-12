<?php

use CaptureModelImport\Controller\CaptureModelImportController;

return [
  'router' => [
    'routes' => [
      'admin' => [
        'child_routes' => [
          'model-import' => [
            'type' => 'Literal',
            'options' => [
              'route' => '/model-import',
              'defaults' => [
                '__NAMESPACE__' => '',
                'controller' => CaptureModelImportController::class,
                'action' => 'capture',
              ],
            ],
            'may_terminate' => true,
            'child_routes' => [
              'importing' => [
                'type' => 'Literal',
                'options' => [
                  'route' => '/importing',
                  'defaults' => [
                    '__NAMESPACE__' => '',
                    'controller' => CaptureModelImportController::class,
                    'action' => 'importing',
                  ],
                ],
              ],
              'process' => [
                'type' => 'Literal',
                'options' => [
                  'route' => '/process',
                  'defaults' => [
                    '__NAMESPACE__' => '',
                    'controller' => CaptureModelImportController::class,
                    'action' => 'process',
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
      'model-export' => [
        'type' => 'Literal',
        'options' => [
          'route' => '/model-export',
          'defaults' => [
            '__NAMESPACE__' => '',
            'controller' => CaptureModelImportController::class,
            'action' => 'capture',
          ],
        ],
        'may_terminate' => true,
        'child_routes' => [
          'inline' => [
            'type' => 'segment',
            'options' => [
              'route' => '/inline/:id',
              'defaults' => [
                '__NAMESPACE__' => '',
                'controller' => CaptureModelImportController::class,
                'action' => 'inline',
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
        'label' => 'Capture Model Importer',
        'route' => 'admin/model-import',
        'resource' => CaptureModelImportController::class,
        'pages' => [
          [
            'label' => 'Import',
            'route' => 'admin/model-import',
            'resource' => CaptureModelImportController::class,
          ],
        ],
      ],
    ],
  ],
];

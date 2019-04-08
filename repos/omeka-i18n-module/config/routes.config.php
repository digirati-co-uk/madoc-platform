<?php
/**
 * Routes.
 *
 * Routes can be defined in the normal Zend way. They can also be
 * abstracted into commonly used fragments. This can help avoid bugs
 * and improve readability and provide as much IDE support as you need.
 */

namespace i18n\Controller;

function i18n_route($route, $class, $method)
{
    return [
        'type' => 'segment',
        'options' => [
            'route' => $route,
            'defaults' => [
                '__NAMESPACE__' => '',
                'controller' => $class,
                'action' => $method,
            ],
        ],
    ];
}

return [
    'router' => [
        'routes' => [
            'i18n-page-translate' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/admin/s/:site-slug/page/:page-slug/translate',
                    'constraints' => [
                        'site-slug' => '[a-zA-Z0-9_-]+',
                        'page-slug' => '[a-zA-Z0-9_-]+',
                    ],
                    'defaults' => [
                        'controller' => Transifex::class,
                        'action' => 'show',
                        '__SITE__' => true,
                        '__ADMIN__' => true,
                    ],
                ],
            ],
            'i18n-language-select' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/i18n/change-language/:newLocale',
                    'defaults' => [
                        'controller' => LanguageSelectionController::class,
                        'action' => 'switch',
                    ],
                ],
            ],
            'admin' => [
                'child_routes' => [
                    'i18n-synchronize' => [
                        'type' => 'literal',
                        'may_terminate' => true,
                        'options' => [
                            'route' => '/i18n/synchronize',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => TranslationSyncController::class,
                                'action' => 'show',
                            ],
                        ],
                    ],
                    'i18n-synchronize-submit' => [
                        'type' => 'literal',
                        'may_terminate' => true,
                        'options' => [
                            'route' => '/i18n/synchronize/submit',
                            'defaults' => [
                                '__NAMESPACE__' => '',
                                'controller' => TranslationSyncController::class,
                                'action' => 'process',
                            ],
                        ],
                    ],
                ],
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
                'child_routes' => [
                    'i18n-export' => i18n_route('/i18n/export', TransifexExportController::class, 'export'),
                ],
            ],
        ],
    ],
];

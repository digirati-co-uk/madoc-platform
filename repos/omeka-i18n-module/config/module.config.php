<?php

namespace i18n;

use Digirati\OmekaShared\Helper\LocaleHelper;
use Digirati\OmekaShared\Helper\UrlHelper;
use i18n\Mvc\Router\SkippableSegment;
use i18n\View\Helper\LanguageSwitcher;
use i18n\View\Helper\Locale;
use Psr\Container\ContainerInterface;

return [
    'view_manager' => [
        'template_path_stack' => [
            realpath(__DIR__.'/../view'),
        ],
    ],
    'route_manager' => [
        'invokables' => [
            'SkippableSegment' => SkippableSegment::class,
        ],
    ],
    'view_helpers' => [
        'factories' => [
            'languageSwitcher' => function (ContainerInterface $c) {
                $config = $c->get('Config');
                return new LanguageSwitcher(
                    $c->get('MvcTranslator'),
                    $c->get(LocaleHelper::class),
                    $c->get(UrlHelper::class),
                    $config['locales'] ?? null
                );
            },
            'locale' => function () {
                return new Locale();
            },
        ],
    ],
    'block_layouts' => [],
    'entity_manager' => [
        'mapping_classes_paths' => [
            __DIR__.'/../src/Model',
        ],
    ],
    'navigation' => [
        'AdminModule' => [
            [
                'label' => 'Synchronize translations',
                'route' => 'admin/i18n-synchronize',
            ],
        ],
        'site' => [
            [
                'label' => 'Translations', // @translate
                'class' => 'vocabularies',
                'order' => 5,
                'route' => 'i18n-admin-translate',
                'action' => 'edit',
                'privilege' => 'update',
                'useRouteMatch' => true,
            ],
        ]
    ],
    'transifex' => [
        'apikey' => getenv('OMEKA__TRANSIFEX_KEY'),
        'secret_key' => '-unused-',
    ],
];

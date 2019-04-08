<?php

namespace i18n;

use i18n\View\Helper\LanguageSwitcher;
use i18n\View\Helper\Locale;

/*
 * Module configuration
 *
 * This contains an example of an extra field of configuration that needs
 * to be included BUT it contains a PHP constant, so cannot be in a YAML file.
 *
 * These are most commonly paths and environment.
 */
return [
    'view_manager' => [
        'template_path_stack' => [
            realpath(__DIR__.'/../view'),
        ],
    ],
    'view_helpers' => [
        'factories' => [
            'languageSwitcher' => function ($c) {
                return new LanguageSwitcher($c->get('MvcTranslator'));
            },
            'locale' => function ($c) {
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
    ],
    'transifex' => [
        'apikey' => getenv('OMEKA__TRANSIFEX_KEY'),
        'secret_key' => '-unused-',
    ],
];

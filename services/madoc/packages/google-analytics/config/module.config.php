<?php

use GoogleAnalytics\Events\GoogleScriptTagEventListener;

return [
    'service_manager' => [
        'factories' => [
            GoogleScriptTagEventListener::class => function ($container) {
                return new GoogleScriptTagEventListener(
                    $container->get('Omeka\Settings')
                );
            },
        ],
    ],
];

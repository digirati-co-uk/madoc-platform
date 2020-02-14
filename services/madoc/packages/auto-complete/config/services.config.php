<?php
use AutoComplete\Api\OmekaResourceClassQueryListener;
use AutoComplete\Completion\CompletionService;
use AutoComplete\Completion\Contributors\FastResourceCompletionContributor;
use AutoComplete\Completion\Contributors\OmekaItemCompletionContributor;
use GuzzleHttp\Client;

return [
    'service_manager' => [
        'invokables' => [],
        'factories' => [
            OmekaItemCompletionContributor::class => function ($container) {
                return new OmekaItemCompletionContributor($container->get('Omeka\ApiManager'));
            },

            FastResourceCompletionContributor::class => function () {
                return new FastResourceCompletionContributor(new Client());
            },

            CompletionService::class => function ($container) {

                return new CompletionService(
                    $container->get(OmekaItemCompletionContributor::class),
                    $container->get(FastResourceCompletionContributor::class)
                );
            },

            OmekaResourceClassQueryListener::class => function () {
                return new OmekaResourceClassQueryListener();
            }
        ],
    ],
];

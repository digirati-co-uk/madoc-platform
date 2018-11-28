<?php

use Digirati\OmekaShared\Factory\EventDispatcherFactory;
use Digirati\OmekaShared\Factory\UrlHelperFactory;
use Digirati\OmekaShared\Helper\UrlHelper;
use Symfony\Component\EventDispatcher\EventDispatcher;

return [
    'service_manager' => [
        'factories' => [
            EventDispatcher::class => EventDispatcherFactory::class,
            UrlHelper::class => UrlHelperFactory::class,
        ],
    ],
];

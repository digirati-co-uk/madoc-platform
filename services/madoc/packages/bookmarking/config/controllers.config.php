<?php

use Bookmarking\Controller\BookmarkController;
use Psr\Container\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcher;

return [
    'controllers' => [
        'factories' => [
            BookmarkController::class => function (ContainerInterface $c) {
                return new BookmarkController($c->get(EventDispatcher::class));
            },
        ],
    ],
];

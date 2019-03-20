<?php

use Digirati\OmekaShared\Helper\SettingsHelper;
use Psr\Container\ContainerInterface;
use IIIFStorage\Controller\CollectionController;
use IIIFStorage\Controller\ManifestController;
use IIIFStorage\Controller\ResourceController;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use IIIFStorage\Utility\ApiRouter;
use IIIFStorage\Utility\Router;

return [
    'controllers' => [
        'invokables' => [],
        'factories' => [
            ResourceController::class => function (ContainerInterface $c) {
                return new ResourceController(
                    $c->get(ManifestRepository::class),
                    $c->get(ManifestBuilder::class),
                    $c->get(CanvasRepository::class),
                    $c->get(CanvasBuilder::class),
                    $c->get(CollectionRepository::class),
                    $c->get(CollectionBuilder::class)
                );
            },
            CollectionController::class => function (ContainerInterface $c) {
                return new CollectionController(
                    $c->get(CollectionRepository::class),
                    $c->get(CollectionBuilder::class),
                    $c->get(Router::class),
                    $c->get(ApiRouter::class),
                    $c->get(SettingsHelper::class)
                );
            },
            ManifestController::class => function(ContainerInterface $c) {
                return new ManifestController(
                    $c->get(ManifestRepository::class),
                    $c->get(ManifestBuilder::class),
                    $c->get(Router::class),
                    $c->get(CollectionRepository::class),
                    $c->get(CollectionBuilder::class),
                    $c->get(CanvasRepository::class),
                    $c->get(CanvasBuilder::class),
                    $c->get(ApiRouter::class),
                    $c->get(SettingsHelper::class)
                );
            }
        ],
    ],
];

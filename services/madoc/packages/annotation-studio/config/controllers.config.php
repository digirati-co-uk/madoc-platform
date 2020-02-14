<?php

use AnnotationStudio\CaptureModel\CaptureModelRepository;
use AnnotationStudio\CaptureModel\Router;
use AnnotationStudio\Controller\CaptureModelController;
use Psr\Container\ContainerInterface;

return [
    'controllers' => [
        'factories' => [
            CaptureModelController::class => function (ContainerInterface $c) {
                return new CaptureModelController(
                    $c->get(CaptureModelRepository::class),
                    $c->get('Omeka\Logger'),
                    $c->get(Router::class)
                );
            },
        ],
    ],
];

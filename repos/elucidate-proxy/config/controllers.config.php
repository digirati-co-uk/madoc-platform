<?php

use Elucidate\ClientInterface;
use ElucidateProxy\Controller\AnnotationController;
use ElucidateProxy\Controller\ContainerController;
use ElucidateProxy\Controller\ElucidateProxyController;
use ElucidateProxy\Domain\ElucidateResponseFactory;
use Psr\Container\ContainerInterface;

return [
    'controllers' => [
        'factories' => [
            AnnotationController::class => function (ContainerInterface $c) {
                return new AnnotationController($c->get(ElucidateResponseFactory::class), $c->get(ClientInterface::class));
            },
            ContainerController::class => function (ContainerInterface $c) {
                return new ContainerController($c->get(ElucidateResponseFactory::class), $c->get(ClientInterface::class));
            },
            ElucidateProxyController::class => function ($c) {
                return new ElucidateProxyController($c->get(ElucidateResponseFactory::class));
            },
        ],
    ],
];

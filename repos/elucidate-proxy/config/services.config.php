<?php

use Digirati\OmekaShared\Factory\EventDispatcherFactory;
use Elucidate\Adapter\GuzzleHttpAdapter;
use Elucidate\Adapter\HttpAdapter;
use Elucidate\Client;
use Elucidate\ClientInterface;
use Elucidate\EventAwareClient;
use ElucidateProxy\Domain\ElucidateResponseFactory;
use ElucidateProxy\Subscriber\ElucidateErrorSubscriber;
use Psr\Container\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Zend\Uri\Uri;

return [
    'service_manager' => [
        'factories' => [
            EventDispatcher::class => EventDispatcherFactory::class,
            HttpAdapter::class => function (ContainerInterface $c) {
                return new GuzzleHttpAdapter(
                    new GuzzleHttp\Client([
                        'base_uri' => getenv('OMEKA__ELUCIDATE_URL') . '/annotation/w3c/',
                    ]), false
                );
            },
            ClientInterface::class => function (ContainerInterface $c) {
                return new EventAwareClient(
                    new Client($c->get(HttpAdapter::class)),
                    $c->get(EventDispatcher::class)
                );
            },
            ElucidateResponseFactory::class => function ($container) {
                $config = $container->get('Config');

                return new ElucidateResponseFactory($config['elucidate_proxy']['trusted_origins'] ?? []);
            },
            ElucidateErrorSubscriber::class => function ($container) {
                return new ElucidateErrorSubscriber($container->get(ElucidateResponseFactory::class));
            },
        ],
    ],
];

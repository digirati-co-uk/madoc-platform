<?php

use PublicUser\Extension\ConfigurableMailer;
use PublicUser\Extension\ConfigurableMailerFactory;
use PublicUser\Settings\PublicUserSettings;
use PublicUser\Site\SiteListeners;
use PublicUser\Site\SiteProvider;
use Psr\Container\ContainerInterface;
use PublicUser\Stats\AnnotationStatisticsService;
use PublicUser\Stats\BookmarksService;
use PublicUser\Stats\ContributorsService;
use PublicUser\Subscriber\AnnotationCreatorElucidateSubscriber;
use PublicUser\Subscriber\AnnotationStatsSubscriber;

return [
    'service_manager' => [
        'factories' => [
            ConfigurableMailer::class => ConfigurableMailerFactory::class,
            PublicUserSettings::class => function (ContainerInterface $container) {
                return new PublicUserSettings(
                    $container->get('Omeka\Settings')
                );
            },

            ContributorsService::class => function ($container) {
                return new ContributorsService(
                    $container->get('Omeka\Connection')
                );
            },

            BookmarksService::class => function ($container) {
                return new BookmarksService(
                    $container->get(GuzzleHttp\Client::class),
                    $container->get('Omeka\Connection')
                );
            },

            AnnotationStatisticsService::class => function ($container) {
                return new AnnotationStatisticsService(
                    $container->get('Omeka\Connection')
                );
            },

            AnnotationStatsSubscriber::class => function ($container) {
                return new AnnotationStatsSubscriber(
                    $container->get('Omeka\ApiManager'),
                    $container->get('Omeka\Connection'),
                    $container->get('Omeka\AuthenticationService')
                );
            },

            SiteProvider::class => function () {
                return new SiteProvider();
            },

            SiteListeners::class => function (ContainerInterface $container) {
                return new SiteListeners(
                    $container->get(SiteProvider::class)
                );
            },

            AnnotationCreatorElucidateSubscriber::class => function () {
                return new AnnotationCreatorElucidateSubscriber();
            },
        ],
    ],
];

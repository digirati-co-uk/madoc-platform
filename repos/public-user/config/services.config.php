<?php

use Digirati\OmekaShared\Factory\PropertyIdSaturatorFactory;
use Digirati\OmekaShared\Factory\SettingsHelperFactory;
use Digirati\OmekaShared\Helper\SettingsHelper;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\Repository\CanvasRepository;
use PublicUser\Auth\TokenService;
use PublicUser\Auth\TokenStorage;
use PublicUser\Extension\ConfigurableMailer;
use PublicUser\Extension\ConfigurableMailerFactory;
use PublicUser\Settings\AuthSettings;
use PublicUser\Settings\PublicUserSettings;
use PublicUser\Site\SiteListeners;
use PublicUser\Site\SiteProvider;
use Psr\Container\ContainerInterface;
use PublicUser\Stats\AnnotationStatisticsService;
use PublicUser\Stats\BookmarksService;
use PublicUser\Stats\ContributorsService;
use PublicUser\Subscriber\AnnotationCreatorElucidateSubscriber;
use PublicUser\Subscriber\AnnotationStatsSubscriber;
use Symfony\Component\EventDispatcher\EventDispatcher;
use PublicUser\Subscriber\ManifestStatsSubscriber;
use PublicUser\Subscriber\PreDeleteCanvasSubscriber;

return [
    'service_manager' => [
        'factories' => [
            EventDispatcher::class => function() {
                return new EventDispatcher();
            },
            SettingsHelper::class => SettingsHelperFactory::class,
            ConfigurableMailer::class => ConfigurableMailerFactory::class,
            PropertyIdSaturator::class => PropertyIdSaturatorFactory::class,
            PublicUserSettings::class => function (ContainerInterface $container) {
                return new PublicUserSettings(
                    $container->get('Omeka\Settings'),
                    $container->get(SettingsHelper::class)
                );
            },

            AuthSettings::class => function (ContainerInterface $container) {
                // @todo hook up to actual settings.
                return new AuthSettings(
                    AuthSettings::EXAMPLE_SETTINGS['clients'],
                    AuthSettings::EXAMPLE_SETTINGS['scopes']
                );
            },

            TokenService::class => function (ContainerInterface $container) {
                return new TokenService(
                    $container->get(AuthSettings::class),
                    $container->get(TokenStorage::class)
                );
            },

            TokenStorage::class => function (ContainerInterface $container) {
                return new TokenStorage(
                    $container->get('Omeka\Connection')
                );
            },

            ContributorsService::class => function (ContainerInterface $container) {
                return new ContributorsService(
                    $container->get('Omeka\Connection')
                );
            },

            BookmarksService::class => function (ContainerInterface $container) {
                return new BookmarksService(
                    $container->get(GuzzleHttp\Client::class),
                    $container->get('Omeka\Connection'),
                    $container->get(CanvasRepository::class),
                    $container->get(CanvasBuilder::class)
                );
            },

            AnnotationStatisticsService::class => function (ContainerInterface $container) {
                return new AnnotationStatisticsService(
                    $container->get('Omeka\Connection')
                );
            },

            AnnotationStatsSubscriber::class => function (ContainerInterface $container) {
                return new AnnotationStatsSubscriber(
                    $container->get('Omeka\ApiManager'),
                    $container->get('Omeka\Connection'),
                    $container->get('Omeka\AuthenticationService'),
                    $container->get('Omeka\Logger')
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

            PreDeleteCanvasSubscriber::class => function (ContainerInterface $container) {
                return new PreDeleteCanvasSubscriber(
                    $container->get('Omeka\Logger'),
                    $container->get('Omeka\Connection')
                );
            },

            ManifestStatsSubscriber::class => function (ContainerInterface $c) {
                return new ManifestStatsSubscriber(
                    $c->get('Omeka\Connection'),
                    $c->get(PropertyIdSaturator::class)
                );
            }
        ],
    ],
];

<?php

use Digirati\OmekaShared\Factory\PropertyIdSaturatorFactory;
use Digirati\OmekaShared\Factory\SettingsHelperFactory;
use Digirati\OmekaShared\Helper\SettingsHelper;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Psr\Container\ContainerInterface;
use PublicUser\Auth\TokenService;
use PublicUser\Auth\TokenStorage;
use PublicUser\Extension\ConfigurableMailer;
use PublicUser\Extension\ConfigurableMailerFactory;
use PublicUser\Invitation\InvitationService;
use PublicUser\Invitation\InvitationSettings;
use PublicUser\Invitation\InvitationStorage;
use PublicUser\Settings\AuthSettings;
use PublicUser\Settings\PublicUserSettings;
use PublicUser\Site\SiteListeners;
use PublicUser\Site\SiteProvider;
use PublicUser\Stats\AnnotationStatisticsService;
use PublicUser\Stats\BookmarksService;
use PublicUser\Stats\ContributorsService;
use PublicUser\Subscriber\AnnotationCreatorElucidateSubscriber;
use PublicUser\Subscriber\AnnotationStatsSubscriber;
use PublicUser\Subscriber\ManifestStatsSubscriber;
use PublicUser\Subscriber\PreDeleteCanvasSubscriber;
use Symfony\Component\EventDispatcher\EventDispatcher;

return [
    'service_manager' => [
        'factories' => [
            EventDispatcher::class => function () {
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
                    $container->get('Omeka\Connection')
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
            },

            // Invitations
            InvitationSettings::class => function (ContainerInterface $c) {
                // @todo add to site configuration form.
                return new InvitationSettings(
                    100000,
                    100,
                    'Transcriber',
                    'viewer',
                    15
                );
            },
            InvitationStorage::class => function (ContainerInterface $c) {
                return new InvitationStorage($c->get('Omeka\Connection'));
            },
            InvitationService::class => function (ContainerInterface $c) {
                return new InvitationService(
                    $c->get(InvitationStorage::class),
                    $c->get(InvitationSettings::class),
                    $c->get('Omeka\AuthenticationService')
                );
            }
        ],
    ],
];

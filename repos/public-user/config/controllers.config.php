<?php

use Digirati\OmekaShared\Helper\SettingsHelper;
use Interop\Container\ContainerInterface;
use PublicUser\Controller\AccountController;
use PublicUser\Auth\TokenService;
use PublicUser\Controller\AuthController;
use PublicUser\Controller\LoginController;
use PublicUser\Controller\PublicProfileController;
use PublicUser\Controller\SiteLoginRedirectController;
use PublicUser\Controller\UserProfileController;
use PublicUser\Extension\ConfigurableMailer;
use PublicUser\Settings\PublicUserSettings;
use PublicUser\Stats\AnnotationStatisticsService;
use PublicUser\Stats\BookmarksService;
use Symfony\Component\EventDispatcher\EventDispatcher;

return [
    'controllers' => [
        'factories' => [
            LoginController::class => function (ContainerInterface $c) {
                return new LoginController(
                    $c->get('Omeka\EntityManager'),
                    $c->get('Omeka\AuthenticationService'),
                    $c->get(PublicUserSettings::class),
                    $c->get('Omeka\Logger'),
                    $c->get(ConfigurableMailer::class),
                    $c->get('Omeka\Acl')
                );
            },
            SiteLoginRedirectController::class => function () {
                return new SiteLoginRedirectController();
            },
            AuthController::class => function(ContainerInterface $c) {
                return new AuthController(
                    $c->get('Omeka\AuthenticationService'),
                    $c->get(TokenService::class)
                );
            },
            AccountController::class => function (ContainerInterface $c) {
                return new AccountController(
                    $c->get('Omeka\EntityManager'),
                    $c->get(AnnotationStatisticsService::class),
                    $c->get(BookmarksService::class),
                    $c->Get('Omeka\Settings')
                );
            },
            UserProfileController::class => function (ContainerInterface $c) {
                return new UserProfileController(
                    $c->get('Omeka\ApiManager'),
                    $c->get('Omeka\AuthenticationService'),
                    $c->get(PublicUserSettings::class)
                );
            },
            PublicProfileController::class => function (ContainerInterface $c) {
                return new PublicProfileController(
                    $c->get(SettingsHelper::class),
                    $c->get('Omeka\AuthenticationService'),
                    $c->get(EventDispatcher::class)
                );
            }
        ],
    ],
];

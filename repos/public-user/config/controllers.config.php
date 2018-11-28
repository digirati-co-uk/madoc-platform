<?php

use Interop\Container\ContainerInterface;
use PublicUser\Controller\AccountController;
use PublicUser\Controller\LoginController;
use PublicUser\Controller\SiteLoginRedirectController;
use PublicUser\Controller\UserProfileController;
use PublicUser\Extension\ConfigurableMailer;
use PublicUser\Settings\PublicUserSettings;
use PublicUser\Stats\AnnotationStatisticsService;
use PublicUser\Stats\BookmarksService;

return [
    'controllers' => [
        'factories' => [
            LoginController::class => function (ContainerInterface $c) {
                return new LoginController(
                    $c->get('Omeka\EntityManager'),
                    $c->get('Omeka\AuthenticationService'),
                    $c->get(PublicUserSettings::class),
                    $c->get('Omeka\Settings'),
                    $c->get('Omeka\Connection'),
                    $c->get('Omeka\Logger'),
                    $c->get(ConfigurableMailer::class)
                );
            },
            SiteLoginRedirectController::class => function ($c) {
                return new SiteLoginRedirectController();
            },
            AccountController::class => function (ContainerInterface $c) {
                return new AccountController(
                    $c->get('Omeka\EntityManager'),
                    $c->get(AnnotationStatisticsService::class),
                    $c->get(BookmarksService::class)
                );
            },
            UserProfileController::class => function ($c) {
                return new UserProfileController(
                    $c->get('Omeka\ApiManager'),
                    $c->get('Omeka\AuthenticationService'),
                    $c->get(PublicUserSettings::class)
                );
            },
        ],
    ],
];

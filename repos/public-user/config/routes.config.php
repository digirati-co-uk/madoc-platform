<?php

use PublicUser\Controller\AuthController;
use PublicUser\Controller\LoginController;
use PublicUser\Controller\AccountController;
use PublicUser\Controller\PublicProfileController;
use PublicUser\Controller\SiteLoginRedirectController;
use PublicUser\Controller\UserProfileController;

function route_public_user($route, $class, $method)
{
    return [
        'type' => 'segment',
        'options' => [
            'route' => $route,
            'verb' => 'get,put,post,options',
            'defaults' => [
                '__NAMESPACE__' => '',
                'controller' => $class,
                'action' => $method,
            ],
        ],
    ];
}

return [
    'router' => [
        'routes' => [
            'create-password' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/create-password/:key',
                    'constraints' => [
                        'key' => '[a-zA-Z0-9]+',
                    ],
                    'defaults' => [
                        'controller' => LoginController::class,
                        'action' => 'create-password',
                    ],
                ],
            ],
            'login' => route_public_user('/login', SiteLoginRedirectController::class, 'login'),
            'site' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/s/:site-slug',
                    'constraints' => [
                        'site-slug' => '[a-zA-Z0-9_-]+',
                    ],
                    'defaults' => [
                        '__NAMESPACE__' => 'Omeka\Controller\Site',
                        '__SITE__' => true,
                        'controller' => 'Index',
                        'action' => 'index',
                    ],
                ],
                'child_routes' => [
                    'publicuser-login' => route_public_user('/login', LoginController::class, 'login'),
                    'publicuser-login-page' => route_public_user('/page/login', LoginController::class, 'login'),
                    'publicuser-logout' => route_public_user('/logout', LoginController::class, 'logout'),
                    'publicuser-forgot' => route_public_user('/forgotten-password', LoginController::class, 'forgotPassword'),
                    'publicuser-register' => route_public_user('/register', LoginController::class, 'register'),
                    'publicuser-register-page' => route_public_user('/page/register', LoginController::class, 'register'),
                    'publicuser-register-success' => route_public_user('/register/thank-you', LoginController::class, 'thanks'),
                    'publicuser-profile' => route_public_user('/profile', AccountController::class, 'profile'),
                    'publicuser-profile-info' => route_public_user('/profile-info', UserProfileController::class, 'edit'),
                    'publicuser-public-profile-view' => route_public_user('/user/:id', PublicProfileController::class, 'viewProfile'),

                    'publicuser-auth-login' => route_public_user('/auth', AuthController::class, 'auth'),
                    'publicuser-auth-token' => route_public_user('/auth/token', AuthController::class, 'token'),
                ],
            ],
        ],
    ],
];

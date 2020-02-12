<?php

use PublicUser\Site\SiteListeners;

return [
    'view_manager' => [
        'template_path_stack' => [
            realpath(__DIR__ . '/../view'),
        ],
    ],
    'listeners' => [
        SiteListeners::class,
    ],
    'form_elements' => [
        'factories' => [
            'publicuserconfig' => function (\Psr\Container\ContainerInterface $container, $opts) {
                $globalSettings = $container->get('Omeka\Settings');
                $publicuser_settings = $globalSettings->get('publicuser');
                $apiManager = $container->get('Omeka\ApiManager');
                $response = $apiManager->search('sites', []);
                $sites = $response->getContent();
                $acl = $container->get('Omeka\Acl');
                $roles = $acl->getRoleLabels();
                $form = new \PublicUser\Form\PublicUserConfigForm('publicuserconfig', [
                    'sites' => $sites,
                    'roles' => $roles,
                    'settings' => $publicuser_settings,
                ]);
                $form->setUrlHelper($container->get('ViewHelperManager')->get('Url'));
                $form->setEventManager($container->get('EventManager'));
                $form->setApiManager($apiManager);

                return $form;
            },
        ],
    ],
    'mail' => [
        'transport' => getenv('OMEKA__SMTP_HOST')
            ? [
                'type' => 'smtp',
                'options' => [
                    'name' => 'localhost',
                    'host' => getenv('OMEKA__SMTP_HOST'),
                    'port' => intval(getenv('OMEKA__SMTP_PORT') ?: 587),
                    'connection_class' => 'login',
                    'connection_config' => [
                        'username' => getenv('OMEKA__SMTP_USERNAME'),
                        'password' => getenv('OMEKA__SMTP_PASSWORD'),
                        'ssl' => getenv('OMEKA__SMTP_SECURITY'),
                        'use_complete_quit' => true,
                    ],
                ],
            ]
            : [
                'type' => 'sendmail',
                'options' => [],
            ],
    ],
    'navigation' => [
        'site' => [
            [
                'label' => 'Invitations', // @translate
                'class' => 'resource-templates',
                'order' => 3,
                'route' => 'public-user-invitations',
                'action' => 'list',
                'privilege' => 'update',
                'useRouteMatch' => true,
            ],
        ]
    ],
];

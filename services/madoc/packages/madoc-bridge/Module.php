<?php

namespace MadocBridge;

use MadocBridge\Controller\TemplateController;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Acl;
use Zend\Config\Factory;
use Zend\Mvc\MvcEvent;

class Module extends AbstractModule
{

    private $config;

    public function getConfig()
    {
        return [
            'view_manager' => [
                'template_path_stack' => [
                    realpath(__DIR__ . '/view'),
                ],
            ],
            'controllers' => [
                'factories' => [
                    TemplateController::class => function () {
                        return new TemplateController();
                    },
                ]
            ],
            'router' => [
                'routes' => [
                    'site' => [
                        'child_routes' => [
                            'site-template' => [
                                'type' => 'Segment',
                                'options' => [
                                    'route' => '/_template',
                                    'defaults' => [
                                        '__NAMESPACE__' => '',
                                        'controller' => TemplateController::class,
                                        'action' => 'view',
                                    ]
                                ],

                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            [
                TemplateController::class
            ]
        );
    }

}

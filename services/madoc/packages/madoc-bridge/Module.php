<?php

namespace MadocBridge;

use Exception;
use MadocBridge\Authentication\AuthenticationServiceFactory;
use MadocBridge\Authentication\MadocCookieStorage;
use MadocBridge\Controller\TemplateController;
use MiladRahimi\Jwt\Cryptography\Algorithms\Rsa\RS256Verifier;
use MiladRahimi\Jwt\Cryptography\Keys\RsaPublicKey;
use Omeka\Api\Manager;
use Omeka\Api\Representation\UserRepresentation;
use Omeka\Api\Adapter\SiteAdapter;
use Omeka\Entity\Site;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Acl;
use Psr\Container\ContainerInterface;
use Zend\Authentication\AuthenticationService;
use Zend\EventManager\Event;
use Zend\EventManager\EventManager;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Http\Response;
use Zend\Mvc\MvcEvent;
use MiladRahimi\Jwt\Parser;

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
            'service_manager' => [
                'factories' => [
                    'Omeka\AuthenticationService' => AuthenticationServiceFactory::class,
                    MadocCookieStorage::class => function (ContainerInterface $c) {
                        return new MadocCookieStorage($c->get('Omeka\Connection'));
                    }
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

        /** @var EventManager $em */
        $em = $event->getApplication()->getEventManager();
        $em->attach(
            MvcEvent::EVENT_ROUTE,
            [$this, 'authenticateJWT']
        );
        $em->attach(
            MvcEvent::EVENT_FINISH,
            [$this, 'setCookies']
        );

        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $acl->allow(
            null,
            [
                TemplateController::class
            ]
        );
    }

    public function attachListeners(SharedEventManagerInterface $sharedEventManager)
    {
        $sharedEventManager->attach(
            SiteAdapter::class,
            'api.create.pre',
            [$this, 'beforeSiteCreated'],
            -1000
        );
    }

    public function beforeSiteCreated(Event $event) {
        /** @var Request $request */
        $request = $event->getParam('request');
        // Create wrapper object
        $content = $request->getContent();

        $content['o:theme'] = 'madoc-crowd-sourcing-theme';

        // Export and add our mutated object.
        $request->setContent($content);
    }

    public function setCookies(MvcEvent $event) {
        /** @var MadocCookieStorage $cookies */
        $cookieStorage = $this->getServiceLocator()->get(MadocCookieStorage::class);
        $cookies = $cookieStorage->getCookies();
        if (!empty($cookies)) {
            /** @var Response $response */
            $response = $event->getResponse();
            $headers = $response->getHeaders();
            foreach ($cookies as $cookie) {
                $headers->addHeader($cookie);
            }
        }
    }

    public function authenticateJWT(MvcEvent $event)
    {
        $request = $event->getRequest();
        $bearerHeader = $request->getHeaders()->get('Authorization');
        if (!$bearerHeader) {
            return null;
        }
        $jwtToken = $bearerHeader ? trim(explode('Bearer', $bearerHeader->getFieldValue())[1] ?? '') : '';
        if (!$jwtToken) {
            return null;
        }

        /** @var AuthenticationService $auth */
        $auth = $this->getServiceLocator()->get('Omeka\AuthenticationService');
        if ($auth->getIdentity()) {
            return;
        }

        try {
            $publicKey = new RsaPublicKey('/openssl-certs/madoc.pub');
            $verifier = new RS256Verifier($publicKey);
            $parser = new Parser($verifier);

            $token = $parser->parse($jwtToken);
            $userId = explode('urn:madoc:user:', $token['sub'])[1];

            /** @var \Zend\Permissions\Acl\Acl $acl */
            $acl = $this->getServiceLocator()->get('Omeka\Acl');
            $acl->allow(null, ['Omeka\Api\Adapter\UserAdapter', 'Omeka\Entity\User'], ['read']);
            /** @var Manager $manager */
            $manager = $this->getServiceLocator()->get('Omeka\ApiManager');
            /** @var UserRepresentation $user */
            $user = $manager->read('users', $userId)->getContent();
            $acl->removeAllow(null, ['Omeka\Api\Adapter\UserAdapter', 'Omeka\Entity\User'], ['read']);
            if ($user) {
                $auth->getStorage()->write($user->getEntity());
            }
        } catch (Exception $e) {
            error_log($e);
        }
    }

}

<?php

namespace PublicUser;

use InvalidArgumentException;
use Omeka\Api\Exception\BadRequestException;
use Omeka\Api\Manager;
use Omeka\Api\Representation\UserRepresentation;
use Omeka\Module\AbstractModule;
use PublicUser\Auth\TokenService;
use PublicUser\Module\AclRules;
use PublicUser\Module\ConfigForm;
use PublicUser\Module\EventListeners;
use PublicUser\Module\GetConfig;
use PublicUser\Module\InstallAndUpgrade;
use Zend\Authentication\AuthenticationService;
use Zend\EventManager\EventManager;
use Zend\Mvc\MvcEvent;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Role\GenericRole as Role;

class Module extends AbstractModule
{
    use GetConfig;
    use InstallAndUpgrade;
    use AclRules;
    use ConfigForm;
    use EventListeners;

    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        /** @var EventManager $em */
        $em = $event->getApplication()->getEventManager();
        $em->attach(
            MvcEvent::EVENT_ROUTE,
            [$this, 'authenticateOAuth']
        );

        /** @var \Omeka\Permissions\Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $guest = new Role('Transcriber');

        $acl->addRole($guest);
        $acl->addRoleLabel('Transcriber', 'Transcriber');

        $this->addAclRules($event->getRouter(), $event->getRequest());
    }

    public function authenticateOAuth(MvcEvent $event)
    {
        $request = $event->getRequest();
        $bearerHeader = $request->getHeaders()->get('Authorization');
        if (!$bearerHeader) {
            return null;
        }
        $bearer = $bearerHeader ? trim(explode('Bearer', $bearerHeader->getFieldValue())[1] ?? '') : '';

        if (!$bearer) {
            return null;
        }
        try {
            /** @var TokenService $tokenService */
            $tokenService = $this->getServiceLocator()->get(TokenService::class);
            $accessToken = $tokenService->getAccessToken($bearer);
            if ($accessToken) {
                /** @var Acl $acl */
                $acl = $this->getServiceLocator()->get('Omeka\Acl');
                $acl->allow(null, ['Omeka\Api\Adapter\UserAdapter', 'Omeka\Entity\User'], ['read']);
                /** @var Manager $manager */
                $manager = $this->getServiceLocator()->get('Omeka\ApiManager');
                /** @var UserRepresentation $user */
                $user = $manager->read('users', $accessToken->getUserId())->getContent();
                $acl->removeAllow(null, ['Omeka\Api\Adapter\UserAdapter', 'Omeka\Entity\User'], ['read']);
                if ($user) {
                    /** @var AuthenticationService $auth */
                    $auth = $this->getServiceLocator()->get('Omeka\AuthenticationService');
                    $auth->getStorage()->write($user->getEntity());
                }
            }
        } catch (InvalidArgumentException $e) {
            throw new BadRequestException();
        }
    }
}

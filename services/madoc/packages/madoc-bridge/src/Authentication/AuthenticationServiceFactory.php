<?php

namespace MadocBridge\Authentication;

use Omeka\Authentication\Adapter\KeyAdapter;
use Omeka\Authentication\Adapter\PasswordAdapter;
use Omeka\Authentication\Storage\DoctrineWrapper;
use Zend\Authentication\AuthenticationService;
use Zend\Authentication\Adapter\Callback;
use Zend\Authentication\Storage\Chain;
use Zend\Authentication\Storage\NonPersistent;
use Zend\Authentication\Storage\Session;
use Zend\ServiceManager\Factory\FactoryInterface;
use Interop\Container\ContainerInterface;

/**
 * Authentication service factory.
 */
class AuthenticationServiceFactory implements FactoryInterface
{
    /**
     * Create the authentication service.
     *
     * @return AuthenticationService
     */
    public function __invoke(ContainerInterface $serviceLocator, $requestedName, array $options = null)
    {
        $entityManager = $serviceLocator->get('Omeka\EntityManager');
        $status = $serviceLocator->get('Omeka\Status');

        // Skip auth retrieval entirely if we're installing or migrating.
        if (!$status->isInstalled() ||
            ($status->needsVersionUpdate() && $status->needsMigration())
        ) {
            $storage = new NonPersistent;
            $adapter = new Callback(function () {
                return null;
            });
        } else {
            $userRepository = $entityManager->getRepository('Omeka\Entity\User');
            if ($status->isApiRequest()) {
                // Authenticate using key for API requests.
                $keyRepository = $entityManager->getRepository('Omeka\Entity\ApiKey');
                $storage = new DoctrineWrapper(new NonPersistent, $userRepository);
                $adapter = new KeyAdapter($keyRepository, $entityManager);
            } else {
                $cookies = $serviceLocator->get(MadocCookieStorage::class);
                $storageAdapter = new Chain();
                $storageAdapter->add(new Session, 1);
                $storageAdapter->add($cookies, 2);


                // Authenticate using user/password for all other requests.
                $storage = new DoctrineWrapper($storageAdapter, $userRepository);
                $adapter = new PasswordAdapter($userRepository);
            }
        }

        return new AuthenticationService($storage, $adapter);
    }
}

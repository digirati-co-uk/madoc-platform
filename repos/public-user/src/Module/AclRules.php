<?php

namespace PublicUser\Module;

use Omeka\Entity\User;
use Omeka\Permissions\Assertion\HasSitePermissionAssertion;
use Omeka\Permissions\Assertion\OwnsEntityAssertion;
use Omeka\Permissions\Assertion\SiteIsPublicAssertion;
use Psr\Container\ContainerInterface;
use PublicUser\Acl\IsOnRouteAssertion;
use PublicUser\Acl\IsRegistrationPermittedAssertion;
use PublicUser\Acl\UserHasSitePermission;
use PublicUser\Controller\AccountController;
use PublicUser\Controller\AuthController;
use PublicUser\Controller\LoginController;
use PublicUser\Controller\PublicProfileController;
use PublicUser\Controller\SiteLoginRedirectController;
use PublicUser\Settings\PublicUserSettings;
use PublicUser\Site\SiteProvider;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Assertion\AssertionAggregate;
use Zend\Router\RouteInterface;

trait AclRules
{
    /**
     * @return ContainerInterface
     */
    abstract public function getServiceLocator();

    private function addAclRules(RouteInterface $router, $request)
    {
        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        /** @var PublicUserSettings $settings */
        $settings = $this->getServiceLocator()->get(PublicUserSettings::class);
        /** @var SiteProvider $siteProvider */
        $siteProvider = $this->getServiceLocator()->get(SiteProvider::class);

        // Site permissions
        // The configuration for the extended site permissions (what the new roles can do) is added by the PublicUser
        // and so the definitions for the site permissions are too. This is crossing over the modules a little bit,
        // and they should live in the IIIF-Storage module.
        $acl->addResource('iiif-collection');
        $acl->addResource('iiif-manifest');
        $acl->addResource('iiif-canvas');

        $acl->allow(
            null,
            'iiif-collection',
            'view-all',
            new UserHasSitePermission(
                $settings,
                'view-all-collections'
            )
        );
        $acl->allow(
            null,
            'iiif-collection',
            'view',
            new UserHasSitePermission(
                $settings,
                'view-collection'
            )
        );
        $acl->allow(
            null,
            'iiif-manifest',
            'view',
            new UserHasSitePermission(
                $settings,
                'view-manifest'
            )
        );
        $acl->allow(
            null,
            'iiif-canvas',
            'view',
            new UserHasSitePermission(
                $settings,
                'view-canvas'
            )
        );

        // The default assertion for viewing resources.
        $viewerAssertion = (new AssertionAggregate())
            ->setMode(AssertionAggregate::MODE_AT_LEAST_ONE)
            ->addAssertions([
                new SiteIsPublicAssertion,
                new HasSitePermissionAssertion('viewer'),
            ]);

        // To allow non-logged in users to register
        // PublicUser\Controller\LoginController - register
        $acl->allow(
            null,
            [
                LoginController::class,
            ],
            ['register', 'thanks'],
            new IsRegistrationPermittedAssertion($siteProvider, $settings)
        );

        $acl->allow(
            null,
            [
                LoginController::class,
            ],
            ['login'],
            null
        );

        // In order to update their own user profile.
        $acl->allow(
            null,
            [
                'Omeka\Api\Adapter\UserAdapter',
                'Omeka\Entity\User'
            ],
            ['update', 'change-password'],
            (new AssertionAggregate())
                ->setMode(AssertionAggregate::MODE_ALL)
                ->addAssertions([
                    new IsOnRouteAssertion($router, $request, [
                        'site/publicuser-profile',
                    ])
                ])
        );

        /**
         * Anonymous controllers - every user has access to them, they handle their own permissions.
         *
         * If they fail the other assertions for the resources that are being used then they will fail
         * and stop any further loading of the page.
         */
        $acl->allow(
            null,
            SiteLoginRedirectController::class,
            ['login']
        );

        $acl->allow(
            null,
            LoginController::class,
            ['login', 'logout', 'forgotPassword', 'resetPassword', 'create-password']
        );

        $acl->allow(
            null,
            AuthController::class,
            ['auth', 'token']
        );

        $acl->allow(
            null,
            [
                AccountController::class,
            ],
            ['profile']
        );

        /**
         * Allow users on the public profile view to access the controller and user object.
         */
        $acl->allow(
            null,
            [
                PublicProfileController::class,
                User::class,
            ],
            ['read', 'viewProfile'],
            (new AssertionAggregate())
                ->setMode(AssertionAggregate::MODE_ALL)
                ->addAssertion(
                    new IsOnRouteAssertion($router, $request, [
                        'site/publicuser-public-profile-view'
                    ]))
                ->addAssertion($viewerAssertion)
        );
    }
}

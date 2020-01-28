<?php

namespace PublicUser\Acl;

use PublicUser\Settings\PublicUserSettings;
use PublicUser\Site\SiteProvider;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Assertion\AssertionInterface;
use Zend\Permissions\Acl\Resource\ResourceInterface;
use Zend\Permissions\Acl\Role\RoleInterface;

/**
 * An assertion that checks if user registration is allowed on the {@link ResourceInterface} that access
 * was requested to.
 */
class IsRegistrationPermittedAssertion implements AssertionInterface
{
    /**
     * @var PublicUserSettings
     */
    private $settings;

    /**
     * @var SiteProvider
     */
    private $siteProvider;

    public function __construct(SiteProvider $siteProvider, PublicUserSettings $settings)
    {
        $this->settings = $settings;
        $this->siteProvider = $siteProvider;
    }

    public function assert(Acl $acl, RoleInterface $role = null, ResourceInterface $resource = null, $privilege = null)
    {
        $site = $this->siteProvider->get();

        if (null !== $site && null === $role) {
            if ($site->isPublic() === false) {
                return false;
            }

            return $this->settings->isRegistrationPermitted();
        }

        return true;
    }
}

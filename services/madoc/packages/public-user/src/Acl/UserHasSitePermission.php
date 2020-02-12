<?php


namespace PublicUser\Acl;


use Digirati\OmekaShared\Framework\ResourceWrapper;
use Digirati\OmekaShared\Helper\SitePermissionsHelper;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\User;
use PublicUser\Settings\PublicUserSettings;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Assertion\AssertionInterface;
use Zend\Permissions\Acl\Resource\ResourceInterface;
use Zend\Permissions\Acl\Role\RoleInterface;

class UserHasSitePermission implements AssertionInterface
{

    /**
     * @var PublicUserSettings
     */
    private $settings;
    /**
     * @var string
     */
    private $permission;
    /**
     * @var User | null
     */
    private $user;
    /**
     * @var string|null
     */
    private $role;

    public function __construct(PublicUserSettings $settings, string $permission)
    {
        $this->settings = $settings;
        $this->permission = $permission;
    }

    /**
     * @inheritDoc
     */
    public function assert(Acl $acl, RoleInterface $role = null, ResourceInterface $resource = null, $privilege = null)
    {
        if ($resource instanceof ResourceWrapper) {
            return $this->settings->canUserWithRole($resource->getRoleForSite() ?: 'viewer', $this->permission);
        }

        return true;
    }
}

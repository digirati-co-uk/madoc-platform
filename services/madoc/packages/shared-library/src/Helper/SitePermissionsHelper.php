<?php

namespace Digirati\OmekaShared\Helper;

use Digirati\OmekaShared\Framework\AbstractIngester;
use Omeka\Api\Representation\SitePermissionRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\User;

class SitePermissionsHelper
{
    static function userRoleForSite(User $user = null, SiteRepresentation $site = null)
    {
        if ($user === null || $site === null) {
            return null;
        }
        foreach ($site->sitePermissions() as $permission) {
            /** @var SitePermissionRepresentation $permission */
            if ($permission->user()->id() === $user->getId()) {
                return $permission->role();
            }
        }
    }

    static function isUserAdmin(User $user, SiteRepresentation $site)
    {
        $role = SitePermissionsHelper::userRoleForSite($user, $site);

        return $user->getRoleId() === 'global_admin' || $role === 'admin';
    }

}

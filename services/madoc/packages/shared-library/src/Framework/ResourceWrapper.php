<?php

namespace Digirati\OmekaShared\Framework;

use Digirati\OmekaShared\Helper\SitePermissionsHelper;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\User;
use Zend\Permissions\Acl\Resource\ResourceInterface;

class ResourceWrapper implements ResourceInterface
{
    private $subject;
    /**
     * @var string
     */
    private $id;
    /**
     * @var SiteRepresentation
     */
    private $site;
    private $user;

    public function __construct(
        SiteRepresentation $site,
        $user,
        $id,
        $subject = null
    ) {
        $this->id = is_string($id);
        $this->site = $site;
        $this->user = $user;
        $this->id = $id;
        $this->subject = $subject;
    }

    public function getRoleForSite()
    {
        return SitePermissionsHelper::userRoleForSite($this->user, $this->site);
    }

    public function getResourceId()
    {
        return $this->id;
    }

    public function getResource()
    {
        return $this->subject;
    }

    /**
     * @return SiteRepresentation
     */
    public function getSite(): SiteRepresentation
    {
        return $this->site;
    }

    /**
     * @return User | null
     */
    public function getUser()
    {
        return $this->user;
    }
}

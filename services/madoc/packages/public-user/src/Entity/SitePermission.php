<?php

namespace PublicUser\Entity;

use Omeka\Entity\AbstractEntity;

/**
 * @Entity
 * @Table(
 *     uniqueConstraints={
 *         @UniqueConstraint(
 *             columns={"site_id", "user_id"}
 *         )
 *     }
 * )
 */
class SitePermission extends AbstractEntity
{
    const ROLE_ADMIN = 'admin';
    const ROLE_EDITOR = 'editor';
    const ROLE_VIEWER = 'viewer';

    /**
     * @Id
     * @Column(type="integer")
     * @GeneratedValue
     */
    protected $id;

    /**
     * @Site_id
     * @Column(type="integer")
     */
    protected $site_id;

    /**
     * @User_id
     * @Column(type="integer")
     */
    protected $user_id;

    /**
     * @Column(length=80)
     */
    protected $role;

    public function getId()
    {
        return $this->id;
    }

    public function setSite($site)
    {
        $this->site_id = $site;
    }

    public function getSite()
    {
        return $this->site_id;
    }

    public function setUser($user)
    {
        $this->user_id = $user;
    }

    public function getUser()
    {
        return $this->user_id;
    }

    public function setRole($role)
    {
        $this->role = $role;
    }

    public function getRole()
    {
        return $this->role;
    }
}

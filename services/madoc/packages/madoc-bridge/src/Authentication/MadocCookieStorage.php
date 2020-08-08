<?php

namespace MadocBridge\Authentication;

use DateTime;
use Doctrine\DBAL\Connection;
use Zend\Authentication\Storage\StorageInterface;
use Zend\Http\Header\SetCookie;

class MadocCookieStorage implements StorageInterface
{

    /**
     * @var Connection
     */
    private $connection;

    private $cookies = [];

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    protected $userId;

    /**
     * @inheritDoc
     */
    public function isEmpty()
    {
        return empty($this->userId);
    }

    /**
     * @inheritDoc
     */
    public function read()
    {
        return $this->userId;
    }

    /**
     * @inheritDoc
     */
    public function write($userId)
    {
        $this->userId = $userId;
    }

    public function getCookies() {
        return $this->cookies;
    }

    /**
     * @inheritDoc
     */
    public function clear()
    {
        if (!$this->userId) return;

        $statement = $this->connection->prepare("SELECT is_public, owner_id, slug from site");
        $statement->bindValue('userId', $this->userId);
        $statement->execute();
        $allSites = $statement->fetchAll();

        $statement = $this->connection->prepare("SELECT role from user WHERE id=:userId");
        $statement->bindValue('userId', $this->userId);
        $statement->execute();
        $user = $statement->fetchAll();

        $statement = $this->connection->prepare("SELECT s.id, sp.role, s.slug, s.title FROM site_permission sp LEFT JOIN site s on sp.site_id = s.id WHERE user_id=:userId");
        $statement->bindValue('userId', $this->userId);
        $statement->execute();
        $result = $statement->fetchAll();


        if (empty($allSites) || empty($user)) {
            $this->userId = null;
            return;
        }

        $isAdmin = ($user[0]['role'] === 'admin' || $user[0]['role'] === 'global_admin');
        $sitesFound = [];

        // Users sites.
        foreach ($result as $site) {
            $sitesFound[] = $site['slug'];
        }

        foreach ($allSites as $site) {
            if (
                // Remove all of the sites if admin.
                $isAdmin || 
                // Remove if the user owns the site.
                $site['owner_id'] === $this->userId || 
                // Remove if the site is public.
                $site['is_public'] || 
                // Remove if the user has permissions on the site.
                in_array($site['slug'], $sitesFound)
            ) {
                $this->cookies[] = new SetCookie('madoc/' . $site['slug'], '', new DateTime('2000-01-01'), '/s/' . $site['slug']);
                $this->cookies[] = new SetCookie('madoc/' . $site['slug'] . '.sig', '', new DateTime('2000-01-01'), '/s/' . $site['slug']);
            }
        }

        $this->userId = null;
    }
}

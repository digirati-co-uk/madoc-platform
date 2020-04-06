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
        $statement = $this->connection->prepare("SELECT s.id, sp.role, s.slug, s.title FROM site_permission sp LEFT JOIN site s on sp.site_id = s.id WHERE user_id=:userId");
        $statement->bindValue('userId', $this->userId);
        $statement->execute();

        $result = $statement->fetchAll();

        foreach ($result as $site) {
            $this->cookies[] = new SetCookie('madoc/' . $site['slug'], '', new DateTime('2000-01-01'), '/s/' . $site['slug']);
            $this->cookies[] = new SetCookie('madoc/' . $site['slug'] . '.sig', '', new DateTime('2000-01-01'), '/s/' . $site['slug']);
        }

        $this->userId = null;
    }
}

<?php

namespace PublicUser\Auth;


use DateTime;

class AccessToken
{
    private $accessToken;
    private $clientId;
    private $userId;
    private $expires;
    private $scope;

    public function __construct(
        string $accessToken,
        string $clientId,
        string $userId,
        DateTime $expires,
        array $scope
    ) {
        $this->accessToken = $accessToken;
        $this->clientId = $clientId;
        $this->userId = $userId;
        $this->expires = $expires;
        $this->scope = $scope;
    }

    /**
     * @return array
     */
    public function getScope(): array
    {
        return $this->scope;
    }

    /**
     * @return string
     */
    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    /**
     * @return string
     */
    public function getClientId(): string
    {
        return $this->clientId;
    }

    /**
     * @return DateTime
     */
    public function getExpires(): DateTime
    {
        return $this->expires;
    }

    /**
     * @return string
     */
    public function getUserId(): string
    {
        return $this->userId;
    }
}

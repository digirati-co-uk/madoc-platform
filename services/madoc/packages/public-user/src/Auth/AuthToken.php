<?php

namespace PublicUser\Auth;


use DateTime;

class AuthToken
{

    /**
     * @var string
     */
    private $authorization_code;
    /**
     * @var string
     */
    private $client_id;
    /**
     * @var string
     */
    private $user_id;
    /**
     * @var string
     */
    private $redirect_uri;
    /**
     * @var DateTime
     */
    private $expires;
    /**
     * @var array
     */
    private $scope;

    public function __construct(
        string $authorization_code,
        string $client_id,
        string $user_id,
        string $redirect_uri,
        DateTime $expires,
        array $scope
    ) {
        $this->authorization_code = $authorization_code;
        $this->client_id = $client_id;
        $this->user_id = $user_id;
        $this->redirect_uri = $redirect_uri;
        $this->expires = $expires;
        $this->scope = $scope;
    }

    /**
     * @return string
     */
    public function getAuthorizationCode(): string
    {
        return $this->authorization_code;
    }

    /**
     * @return string
     */
    public function getClientId(): string
    {
        return $this->client_id;
    }

    /**
     * @return string
     */
    public function getUserId(): string
    {
        return $this->user_id;
    }

    /**
     * @return string
     */
    public function getRedirectUri(): string
    {
        return $this->redirect_uri;
    }

    /**
     * @return DateTime
     */
    public function getExpires(): DateTime
    {
        return $this->expires;
    }

    /**
     * @return array
     */
    public function getScope(): array
    {
        return $this->scope;
    }

    /**
     * @param string $state
     * @return string
     */
    public function generateRedirect(string $state): string
    {
        return sprintf('%s#code=%s&state=%s', $this->getRedirectUri(), $this->getAuthorizationCode(), $state);
    }

    /**
     * @return bool
     * @throws \Exception
     */
    public function hasExpired(): bool
    {
        return new DateTime() > $this->getExpires();
    }

}

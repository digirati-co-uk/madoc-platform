<?php

namespace PublicUser\Auth;

use DateInterval;
use DateTime;
use PublicUser\Entity\AuthClient;
use PublicUser\Settings\AuthSettings;

class TokenService
{
    /**
     * @var AuthSettings
     */
    private $settings;
    /**
     * @var TokenStorage
     */
    private $storage;

    public function __construct(AuthSettings $settings, TokenStorage $storage)
    {
        $this->settings = $settings;
        $this->storage = $storage;
    }

    /**
     * @param string $token
     * @return null|AccessToken
     * @throws \Doctrine\DBAL\Exception\InvalidArgumentException
     */
    public function getAccessToken(string $token)
    {
        $accessToken = $this->storage->getAccessTokenById($token);
        if (!$accessToken) {
            return null;
        }
        if ($accessToken->getExpires() < new DateTime()) {
            $this->storage->deleteAccessToken($accessToken);
            return null;
        }
        return $accessToken;
    }

    /**
     * @param string $client_id
     * @param string $redirect_uri
     * @param array $scope
     * @return AuthClient|null
     */
    public function validateRequest(string $client_id, string $redirect_uri, array $scope)
    {
        $client = $this->settings->getClientById($client_id);
        if (!$client) {
            return null;
        }
        if ($client->getRedirectUrl() !== $redirect_uri) {
            return null;
        }
        $invalid = array_diff($scope, $client->getAvailableScopes());
        if (!empty($invalid)) {
            return null;
        }
        // Its valid.
        return $client;
    }

    /**
     * @return string
     * @throws \Exception
     */
    public function createAccessToken(): string
    {
        return bin2hex(random_bytes($this->settings->getAccessTokenLength()));
    }

    /**
     * @return string
     * @throws \Exception
     */
    public function createAuthorizationCode(): string
    {
        return bin2hex(random_bytes($this->settings->getAuthTokenLength()));
    }

    /**
     * @param AuthToken $code
     * @return AccessToken
     * @throws \Doctrine\DBAL\Exception\InvalidArgumentException
     * @throws \Exception
     */
    public function exchangeAuthorizationCode(AuthToken $code): AccessToken
    {
        // Delete the auth code.
        $this->storage->deleteAuthToken($code);
        // Create new access token
        $accessToken = new AccessToken(
            $this->createAccessToken(),
            $code->getClientId(),
            $code->getUserId(),
            new DateTime('next week'),
            $code->getScope()
        );
        // Save it.
        $this->storage->saveAccessToken($accessToken);
        // return it.
        return $accessToken;
    }

    /**
     * @param string $clientId
     * @param string $userId
     * @param array $scope
     * @return AuthToken
     * @throws \Exception
     */
    public function generateAuthorizationCode(string $clientId, string $userId, array $scope)
    {
        // Get client
        $client = $this->settings->getClientById($clientId);
        // Generate auth token
        $token = new AuthToken(
            $this->createAuthorizationCode(),
            $client->getId(),
            $userId,
            $client->getRedirectUrl(),
            (new DateTime())->add(new DateInterval('PT5M')),
                $scope
            );
        // Save it.
        $this->storage->saveAuthToken($token);
        // Return it.
        return $token;
    }

    /**
     * @param string $id
     * @return null|AuthToken
     * @throws \Doctrine\DBAL\Exception\InvalidArgumentException
     */
    public function getAuthToken(string $id)
    {
        $authToken = $this->storage->getAuthTokenById($id);
        if (!$authToken) {
            return null;
        }
        if ($authToken->getExpires() < new DateTime()) {
            $this->storage->deleteAuthToken($authToken);
            return null;
        }
        return $authToken;
    }
}

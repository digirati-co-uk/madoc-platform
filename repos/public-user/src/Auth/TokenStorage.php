<?php

namespace PublicUser\Auth;


use DateTime;
use Doctrine\DBAL\Connection;

class TokenStorage
{
    /**
     * @var Connection
     */
    private $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function saveAuthToken(AuthToken $authToken)
    {
        $this->connection->insert('oauth_authorization_codes', [
            'authorization_code' => $authToken->getAuthorizationCode(),
            'client_id' => $authToken->getClientId(),
            'user_id' => $authToken->getUserId(),
            'redirect_uri' => $authToken->getRedirectUri(),
            'expires' => $authToken->getExpires(),
            'scope' => $authToken->getScope(),
        ], [
            'string',
            'string',
            'string',
            'string',
            'datetime',
            'simple_array'
        ]);
    }

    public function getAuthTokenById(string $id)
    {
        $token = $this->connection->fetchAssoc(
            'SELECT 
              authorization_code,
              client_id,
              user_id,
              redirect_uri,
              expires,
              scope 
            FROM oauth_authorization_codes
            WHERE authorization_code = ?',
            [$id]
        );

        if (!$token) {
            return null;
        }

        return new AuthToken(
            $token['authorization_code'],
            $token['client_id'],
            $token['user_id'],
            $token['redirect_uri'],
            new DateTime($token['expires']),
            explode(',', $token['scope'])
        );
    }

    /**
     * @param AccessToken $accessToken
     * @throws \Doctrine\DBAL\Exception\InvalidArgumentException
     */
    public function deleteAccessToken(AccessToken $accessToken)
    {
        $this->connection->delete('oauth_access_tokens', ['access_token' => $accessToken->getAccessToken()], ['string']);
    }

    /**
     * @param AuthToken $authToken
     * @throws \Doctrine\DBAL\Exception\InvalidArgumentException
     */
    public function deleteAuthToken(AuthToken $authToken)
    {
        $this->connection->delete('oauth_authorization_codes', ['authorization_code' => $authToken->getAuthorizationCode()], ['string']);
    }

    public function saveAccessToken(AccessToken $accessToken)
    {
        $this->connection->insert('oauth_access_tokens',
          [
              'access_token' => $accessToken->getAccessToken(),
              'client_id' => $accessToken->getClientId(),
              'user_id' => $accessToken->getUserId(),
              'expires' => $accessToken->getExpires(),
              'scope' => $accessToken->getScope(),
          ],
          [
              'string',
              'string',
              'string',
              'datetime',
              'simple_array'
          ]
        );
    }

    public function getAccessTokenById(string $id)
    {
        $token = $this->connection->fetchAssoc(
            'SELECT 
              access_token,
              client_id,
              user_id,
              expires,
              scope 
            FROM oauth_access_tokens
            WHERE access_token = ?',
            [$id],
            [
                'string',
                'string',
                'string',
                'datetime',
                'simple_array'
            ]
        );

        if (!$token) {
            return null;
        }

        return new AccessToken(
            $token['access_token'],
            $token['client_id'],
            $token['user_id'],
            new DateTime($token['expires']),
            explode(',', $token['scope'])
        );
    }

}

<?php

namespace PublicUser\Settings;


use PublicUser\Entity\AuthClient;
use PublicUser\Entity\Scope;

class AuthSettings
{
    const EXAMPLE_SETTINGS = [
        'clients' => [
            [
                'id' => 'ida-sorting-room',
                'name' => 'IDA Sorting room',
                'redirect-url' => 'http://sorting-room.dlcs-ida.org/cb',
                'available-scopes' => ['import-iiif']
            ],
            [
                'id' => 'local-testing',
                'name' => 'Local testing',
                'redirect-url' => 'http://localhost:5000',
                'available-scopes' => ['import-iiif']
            ]
        ],
        'scopes' => [
            'admin' => [
                'title' => 'Administration rights',
                'description' => 'Full access to the Omeka instance and admin functions',
                'routes' => ['*'],
            ],
            'import-iiif' => [
                'title' => 'Import IIIF Content',
                'description' => 'Access to importing IIIF content resources',
                'routes' => [
                    '/api/iiif-import'
                ]
            ]
        ]
    ];

    /**
     * @var array
     */
    private $clients;
    /**
     * @var array
     */
    private $scopes;

    public function __construct(
        array $clients,
        array $scopes
    ) {
        $this->clients = array_map(function ($client) {
            return AuthClient::fromSettings($client);
        }, $clients);
        $this->scopes = array_map(function ($scope) {
            return Scope::fromSettings($scope);
        }, $scopes);
    }

    /**
     * @return int
     */
    public function getAccessTokenLength(): int
    {
        return 20; // as per database schema. (40/2)
    }

    /**
     * @return int
     */
    public function getAuthTokenLength(): int
    {
        return 20; // as per database schema. (40/2)
    }

    /**
     * @return array
     */
    public function getClients(): array
    {
        return $this->clients;
    }

    /** @return AuthClient|null */
    public function getClientById(string $clientId)
    {
        $found = array_filter($this->getClients(), function(AuthClient $client) use ($clientId) {
            return $client->getId() === $clientId;
        });
        if (empty($found)) {
            return null;
        }
        return current($found);
    }

    /**
     * @return array
     */
    public function getScopes(): array
    {
        return $this->scopes;
    }

}

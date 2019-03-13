<?php

namespace PublicUser\Entity;

class AuthClient
{
    /**
     * @var string
     */
    private $id;
    /**
     * @var string
     */
    private $name;
    /**
     * @var string
     */
    private $redirectUrl;
    /**
     * @var array
     */
    private $availableScopes;

    public function __construct(string $id, string $name, string $redirectUrl, array $availableScopes) {

        $this->id = $id;
        $this->name = $name;
        $this->redirectUrl = $redirectUrl;
        $this->availableScopes = $availableScopes;
    }

    public static function fromSettings(array $data): AuthClient
    {
        return new AuthClient(
            $data['id'],
            $data['name'],
            $data['redirect-url'],
            $data['available-scopes']
        );
    }

    /**
     * @return string
     */
    public function getId(): string
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getRedirectUrl(): string
    {
        return $this->redirectUrl;
    }

    /**
     * @return array
     */
    public function getAvailableScopes(): array
    {
        return $this->availableScopes;
    }

}

<?php

namespace PublicUser\Entity;

class Scope
{
    /**
     * @var string
     */
    private $title;
    /**
     * @var string
     */
    private $description;
    /**
     * @var array
     */
    private $routes;

    public function __construct(string $title, string $description, array $routes)
    {
        $this->title = $title;
        $this->description = $description;
        $this->routes = $routes;
    }

    public static function fromSettings(array $data): Scope
    {
        return new Scope(
            $data['title'],
            $data['description'],
            $data['routes']
        );
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return $this->description;
    }

    /**
     * @return array
     */
    public function getRoutes(): array
    {
        return $this->routes;
    }
}

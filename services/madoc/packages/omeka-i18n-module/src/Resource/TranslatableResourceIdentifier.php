<?php

namespace i18n\Resource;

class TranslatableResourceIdentifier
{
    const RESOURCE_PART_GLUE = '__RESOURCE__';
    const PROJECT_GLUE = ':';
    /**
     * @var string
     */
    private $resource;
    /**
     * @var string
     */
    private $id;
    /**
     * @var string
     */
    private $project;

    public static function forResource(string $name, string $id = null): TranslatableResourceIdentifier
    {
        return new self($name, $id, null);
    }

    public static function fromString(string $value): TranslatableResourceIdentifier
    {
        $parts = explode(self::PROJECT_GLUE, $value);
        $resourceParts = explode(self::RESOURCE_PART_GLUE, isset($parts[1]) ? $parts[1] : $parts[0]);

        $project = isset($parts[1]) ? $parts[0] : null;
        $id = isset($resourceParts[1]) ? $resourceParts[1] : null;
        $resource = $resourceParts[0];

        return new self($resource, $id, $project);
    }

    private function __construct(string $resource, string $id = null, string $project = null)
    {
        $this->resource = $resource;
        $this->id = $id;
        $this->project = $project;
    }

    public function getResourcePart(): string
    {
        $values = [$this->resource];
        if (null !== $this->id) {
            $values[] = preg_replace('/[^a-z0-9_-]/i', '-', $this->id);
        }

        return implode(self::RESOURCE_PART_GLUE, $values);
    }

    public function getHumanReadableResourcePart(): string
    {
        return str_replace(self::RESOURCE_PART_GLUE, '/', $this->getResourcePart());
    }

    public function getProject()
    {
        return $this->project;
    }

    public function setProject(string $project)
    {
        $this->project = $project;

        return $this;
    }

    public function hasProject()
    {
        return null !== $this->project;
    }

    public function __toString()
    {
        $value = $this->getResourcePart();

        if ($this->hasProject()) {
            $value = implode(self::PROJECT_GLUE, [$this->project, $value]);
        }

        return $value;
    }
}

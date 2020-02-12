<?php

namespace PublicUser\Acl;

use Omeka\Api\Exception\PermissionDeniedException;

class ResourcePermissionDeniedException extends PermissionDeniedException
{
    /**
     * @var string
     */
    private $resource;

    public function __construct($resource)
    {
        $this->resource = $resource;
    }

    public function getResource()
    {
        return $this->resource;
    }
}

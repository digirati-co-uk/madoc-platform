<?php

namespace Digirati\OmekaShared\Helper;

use Traversable;
use Zend\View\Helper\Url;

class UrlHelper
{
    /** @var Url */
    private $url;
    private $builder;

    public function __construct(callable $builder)
    {
        $this->builder = $builder;
    }

    public function setUrl(Url $url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * Generates a url given the name of a route.
     *
     * @param string            $name               Name of the route
     * @param array             $params             Parameters for the link
     * @param array|Traversable $options            Options for the route
     * @param bool              $reuseMatchedParams Whether to reuse matched parameters
     *
     * @return string Url For the link href attribute
     */
    public function create($name = null, $params = [], $options = [], $reuseMatchedParams = false)
    {
        if (!$this->url) {
            $builder = $this->builder;
            $this->setUrl($builder());
        }

        return $this->url->__invoke($name, $params, $options, $reuseMatchedParams);
    }
}

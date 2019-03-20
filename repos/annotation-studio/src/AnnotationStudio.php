<?php

namespace AnnotationStudio;

use AnnotationStudio\Components\Component;

class AnnotationStudio
{
    const VERSION = '1.0.0-rc.25';

    private $components;
    private $isLocked = false;
    private $googleMapApiKey;

    public function __construct()
    {
        $this->components = [];
    }

    public function lock()
    {
        $this->isLocked = true;

        return $this;
    }

    public function setGoogleMapApiKey(string $key) {
        $this->googleMapApiKey = $key;
    }

    public function isLocked()
    {
        return $this->isLocked;
    }

    public function getAssets()
    {
        return implode("\n", [
            $this->googleMapApiKey ? (
                sprintf(
                    '<script type="application/javascript" src="https://maps.googleapis.com/maps/api/js?key=%s&libraries=places"></script>',
                    $this->googleMapApiKey
                )
            ): '',
            sprintf(
                '<script type="application/javascript" src="https://unpkg.com/@annotation-studio/bundle@%s/umd/@annotation-studio/bundle.min.js"></script>',
                static::VERSION
            ),
            sprintf(
                '<link rel="stylesheet" type="text/css" href="https://unpkg.com/@annotation-studio/bundle@%s/umd/main.css" />',
                static::VERSION
            ),
        ]);
    }

    public function addComponent($name, Component $component)
    {
        if (false === $this->isLocked()) {
            $this->components[$name] = $component;
        }
    }

    public function __get($name)
    {
        return $this->__call($name, []);
    }

    public function __call($name, $arguments)
    {
        if (!isset($this->components[$name])) {
            return null;
        }

        $component = $this->components[$name];

        if ($arguments) {
            return $component(...$arguments);
        }

        return $component;
    }
}

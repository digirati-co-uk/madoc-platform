<?php

namespace AnnotationStudio;

use AnnotationStudio\Components\Component;

class AnnotationStudio
{
    const DEFAULT_VERSION = '1.0.0-rc.27';

    private $version;

    private $components;
    private $isLocked = false;
    private $debug = false;
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

    public function debug()
    {
        $this->debug = true;
        return $this;
    }

    public function isLocked()
    {
        return $this->isLocked;
    }

    public function getVersion(): string
    {
        return $this->version ? $this->version : static::DEFAULT_VERSION;
    }

    public function setVersion(string $version)
    {
        if ($version === 'latest') {
            $version = self::DEFAULT_VERSION;
        }
        $this->version = $version;
    }

    public function getWarning(): string
    {
        return (
            '<script type="application/javascript">' .
            'console.warn("The AnnotationStudio module is in debug mode, this should never be enabled on production")' .
            '</script>'
        );
    }

    public function getAssets($baseUrl = '')
    {
        $bundle = sprintf(
            'https://unpkg.com/@annotation-studio/bundle@%s/umd/@annotation-studio/bundle.min.js',
            $this->getVersion()
        );
        if ($this->debug) {
            $bundle = sprintf(
                'https://unpkg.com/@annotation-studio/bundle@%s/umd/@annotation-studio/bundle.js',
                $this->getVersion()
            );
        }

        return implode("\n", [
            sprintf(
                '<script type="application/javascript" src="%s"></script>',
                $bundle
            ),
            $this->debug ? $this->getWarning() : '',
            $this->googleMapApiKey ? sprintf(
                '<script src="https://maps.googleapis.com/maps/api/js?key=%s&libraries=places"></script>',
                $this->googleMapApiKey
            ) : '',
            sprintf(
                '<link rel="stylesheet" type="text/css" href="https://unpkg.com/@annotation-studio/bundle@%s/umd/main.css" />',
                $this->getVersion()
            ),
        ]);
    }

    public function addComponent($name, Component $component)
    {
        if (false === $this->isLocked()) {
            $this->components[$name] = $component;
        }
    }

    public function setGoogleMapApiKey(string $key)
    {
        $this->googleMapApiKey = $key;

        return $this;
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

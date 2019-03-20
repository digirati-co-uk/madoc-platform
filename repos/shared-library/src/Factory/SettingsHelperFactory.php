<?php

namespace Digirati\OmekaShared\Factory;

use Digirati\OmekaShared\Helper\SettingsHelper;
use Interop\Container\ContainerInterface;

class SettingsHelperFactory
{
    public function __invoke(ContainerInterface $c) {
        return new SettingsHelper($c->get('Omeka\Settings\Site'));
    }
}

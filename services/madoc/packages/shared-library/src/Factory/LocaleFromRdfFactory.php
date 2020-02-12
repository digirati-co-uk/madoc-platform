<?php

namespace Digirati\OmekaShared\Factory;

use Digirati\OmekaShared\Helper\LocaleFromRdf;
use Digirati\OmekaShared\Helper\LocaleHelper;
use Interop\Container\ContainerInterface;

class LocaleFromRdfFactory
{
    public function __invoke(ContainerInterface $c) {
        if (!$c->has(LocaleHelper::class)) {
            $localeFactory = new LocaleHelperFactory();
            return new LocaleFromRdf(
                $localeFactory($c)
            );
        }

        return new LocaleFromRdf(
            $c->get(LocaleHelper::class)
        );
    }
}

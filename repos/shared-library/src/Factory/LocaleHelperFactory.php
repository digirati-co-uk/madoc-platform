<?php

namespace Digirati\OmekaShared\Factory;

use Digirati\OmekaShared\Helper\LocaleHelper;
use Interop\Container\ContainerInterface;
use Zend\I18n\Translator\TranslatorInterface;

class LocaleHelperFactory
{
    public function __invoke(ContainerInterface $c) {
        return new LocaleHelper(
            $c->get(TranslatorInterface::class)
        );
    }
}

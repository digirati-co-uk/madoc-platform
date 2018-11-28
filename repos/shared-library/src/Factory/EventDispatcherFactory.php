<?php

namespace Digirati\OmekaShared\Factory;

use Symfony\Component\EventDispatcher\EventDispatcher;

class EventDispatcherFactory
{
    public function __invoke()
    {
        return new EventDispatcher();
    }
}

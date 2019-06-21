<?php


namespace Digirati\OmekaShared\Factory;


use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Psr\Container\ContainerInterface;

class PropertyIdSaturatorFactory
{
    public function __invoke(ContainerInterface $c)
    {
        return new PropertyIdSaturator($c->get('Omeka\ApiManager'));
    }
}

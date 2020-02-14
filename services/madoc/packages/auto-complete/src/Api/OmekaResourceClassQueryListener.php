<?php

namespace AutoComplete\Api;

use Doctrine\ORM\QueryBuilder;
use Omeka\Api\Adapter\AbstractResourceEntityAdapter;
use Zend\EventManager\Event;

final class OmekaResourceClassQueryListener
{
    public function __invoke(Event $event)
    {
        /**
         * @var QueryBuilder $qb
         * @var AbstractResourceEntityAdapter $adapter
         */
        $qb = $event->getParam('queryBuilder');
        $adapter = $event->getTarget();
        $request = $event->getParam('request')->getContent();

        if (isset($request['resource_classes']) && count($request['resource_classes']) > 0) {
            $resourceClassAlias = $adapter->createAlias();

            $qb->innerJoin(
                $adapter->getEntityClass() . '.resourceClass',
                $resourceClassAlias,
                'WITH',
                $qb->expr()->in("$resourceClassAlias.label", $adapter->createNamedParameter($qb, $request['resource_classes']))
            );
        }

        return true;
    }
}

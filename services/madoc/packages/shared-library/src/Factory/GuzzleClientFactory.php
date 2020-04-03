<?php

namespace Digirati\OmekaShared\Factory;

use Doctrine\Common\Cache\ArrayCache;
use Doctrine\Common\Cache\ChainCache;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Kevinrob\GuzzleCache\KeyValueHttpHeader;
use Kevinrob\GuzzleCache\Storage\DoctrineCacheStorage;
use Kevinrob\GuzzleCache\Strategy\GreedyCacheStrategy;
use Kevinrob\GuzzleCache\Strategy\PublicCacheStrategy;
use Psr\Container\ContainerInterface;

class GuzzleClientFactory
{
    public function __invoke(ContainerInterface $c)
    {
        $stack = HandlerStack::create();

        $cacheChain = new ChainCache(
            [
                new ArrayCache(),
            ]
        );

        $cacheStorage = new DoctrineCacheStorage($cacheChain);
        $stack->push(
            new CacheMiddleware(
                new GreedyCacheStrategy(
                    $cacheStorage,
                    36 * 60 * 60,
                    new KeyValueHttpHeader(['Last-Modified'])
                )
            )
        );

        $stack->push(new CacheMiddleware(new PublicCacheStrategy($cacheStorage)));

        return new Client([
            'handler' => $stack,
        ]);
    }

}

<?php


namespace Digirati\OmekaShared\Factory;

use Interop\Container\ContainerInterface;
use Zend\Http\Client;
use Zend\Http\Client\Adapter\Proxy;

class ProxyClientFactory
{
    public function __invoke(ContainerInterface $c)
    {
        $config = $c->get('Config');
        $options = [];
        if (isset($config['http_client']) && is_array($config['http_client'])) {
            $options = $config['http_client'];
        }

        $httpProxy = getenv('HTTP_PROXY');
        if ($httpProxy) {
            $options['adapter'] = Proxy::class;
            $options['proxy_host'] = $httpProxy;

            if ($port = getenv('HTTP_PROXY_PORT')) {
                $options['proxy_port'] = $port;
            }

            if ($user = getenv('HTTP_PROXY_USER')) {
                $options['proxy_user'] = $user;
            }

            if ($pass = getenv('HTTP_PROXY_PASS')) {
                $options['proxy_pass'] = $pass;
            }
        }

        return new Client(null, $options);
    }
}

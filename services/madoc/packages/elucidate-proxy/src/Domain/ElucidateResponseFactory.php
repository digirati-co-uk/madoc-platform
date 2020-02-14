<?php

namespace ElucidateProxy\Domain;

use Elucidate\Model\Annotation;
use Elucidate\Model\Container;
use Elucidate\Model\JsonLDContext;
use Zend\Http\Request;
use Zend\Http\Response;
use Zend\Stdlib\RequestInterface;

/**
 * A factory that creates {@link Response}s for Elucidate requests with the correct
 * access control and content type headers.
 */
final class ElucidateResponseFactory
{
    /**
     * @var string[]
     */
    private $trustedOrigins;

    /**
     * @var string[]
     */
    private $trustedHeaders = [];

    /**
     * @param string[] $trustedOrigins a list of acceptable HTTP origins (scheme://host:port) that will
     *                                 be echoed back to the client as `Access-Control-Allow-Origin`
     * @param string[] $trustedHeaders a list of additional HTTP headers that are permitted in requests to protected
     *                                 endpoints
     */
    public function __construct(array $trustedOrigins, array $trustedHeaders = [])
    {
        $this->trustedOrigins = $trustedOrigins;
        $this->trustedHeaders = array_merge($trustedHeaders, ['X-Annotation-Studio-Locale', 'Content-Type', 'Slug']);
    }

    /**
     * Create and return a new response with {@code data] as it's content and a given {@code statusCode}.  The
     * CORS headers of the {@link Response} will be configured according to the passed {@link Request}.
     *
     * @param Request                          $request
     * @param Container|Annotation|string|null $data
     * @param int                              $statusCode
     *
     * @return Response
     */
    public function create(RequestInterface $request, $data = null, int $statusCode = 200): Response
    {
        $response = new Response();
        $headers = $response->getHeaders();

        if (is_object($data) && in_array(JsonLDContext::class, class_uses($data))) {
            $dataHeaders = $data->getHeaders();
            unset($dataHeaders['Location']);

            $headers->addHeaders($dataHeaders);
            $response->setContent(json_encode($data));
        } elseif (is_string($data)) {
            $response->setContent($data);
        }

        $origin = $request->getHeader('Origin');
        $originValue = $origin ? $origin->getFieldValue() : '*';

        $headers->addHeaders([
            'Access-Control-Allow-Headers' => implode(', ', $this->trustedHeaders),
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Credentials' => 'true',
        ]);

        if (in_array($originValue, $this->trustedOrigins, true)) {
            $headers->addHeaderLine('Access-Control-Allow-Origin', $originValue);
        } else {
            $headers->addHeaderLine('Access-Control-Allow-Origin', implode(' ', $this->trustedOrigins));
        }

        $response->setStatusCode($statusCode);
        $response->setHeaders($headers);

        return $response;
    }
}

<?php

namespace ElucidateProxy\Subscriber;

use Elucidate\Exception\ElucidateRequestException;
use Elucidate\Exception\ElucidateUncaughtException;
use ElucidateProxy\Domain\ElucidateResponseFactory;
use GuzzleHttp\Exception\ConnectException;
use Zend\Mvc\MvcEvent;

final class ElucidateErrorSubscriber
{
    /**
     * @var ElucidateResponseFactory
     */
    private $responseFactory;

    public function __construct(ElucidateResponseFactory $responseFactory)
    {
        $this->responseFactory = $responseFactory;
    }

    public function __invoke(MvcEvent $e)
    {
        $exception = $e->getParam('exception');
        if (!$exception) {
            return null;
        }

        $request = $e->getRequest();

        if ($exception instanceof ElucidateRequestException || $exception instanceof ElucidateUncaughtException) {
            $prev = $exception->getPrevious();
            if ($prev instanceof ConnectException) {
                return $this->responseFactory->create($request, $exception->getMessage(), 500);
            }

            if (!method_exists($exception, 'getResponse')) {
                error_log('Unknown error');
                return $this->responseFactory->create($request, $exception->getMessage(), 500);
            }

            $response = $exception->getResponse();
            if ($response) {
                return $this->responseFactory->create(
                    $request,
                    (string) $response->getBody(),
                    $response->getStatusCode()
                );
            }
        }
    }
}

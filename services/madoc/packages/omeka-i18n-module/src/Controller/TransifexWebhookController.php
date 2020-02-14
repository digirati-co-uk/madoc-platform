<?php

namespace i18n\Controller;

use i18n\Event\TransifexEventDispatcher;
use i18n\Model\TransifexEvent;
use i18n\Security\TransifexRequestAuthenticator;
use Zend\Diactoros\Response\EmptyResponse;
use Zend\Json\Json;
use Zend\Psr7Bridge\Psr7ServerRequest;

class TransifexWebhookController extends AbstractPsr7ActionController
{
    /**
     * @var TransifexRequestAuthenticator
     */
    private $requestAuthenticator;

    /**
     * @var TransifexEventDispatcher
     */
    private $eventHandler;

    public function __construct(TransifexRequestAuthenticator $requestAuthenticator,
                                TransifexEventDispatcher $eventHandler)
    {
        $this->requestAuthenticator = $requestAuthenticator;
        $this->eventHandler = $eventHandler;
    }

    public function translationCompleted()
    {
        $request = Psr7ServerRequest::fromZend($this->getRequest());
        $requestBody = (string) $request->getBody();

        if (!$this->requestAuthenticator->authenticate(
            $request->getHeaderLine('HTTP_HTTP_DATE'),
            $request->getHeaderLine('HTTP_X_TX_URL'),
            $request->getHeaderLine('HTTP_X_TX_SIGNATURE_V2'),
            $requestBody
        )) {
            return new EmptyResponse(401);
        }

        $event = TransifexEvent::from(Json::decode($requestBody, true));
        $this->eventHandler->handle($event);

        return new EmptyResponse();
    }
}

<?php

namespace ElucidateProxy\Controller;

use ElucidateProxy\Domain\ElucidateResponseFactory;
use Zend\Mvc\Controller\AbstractActionController;

class ElucidateProxyController extends AbstractActionController
{
    /**
     * @var ElucidateResponseFactory
     */
    private $responseFactory;

    public function __construct(ElucidateResponseFactory $responseFactory)
    {
        $this->responseFactory = $responseFactory;
    }

    /**
     * Handles a CORS preflight request for any routes that can mutate data in Elucidate,
     * for both containers and annotations.
     *
     * @return \Zend\Http\Response
     */
    public function preflightAction()
    {
        return $this->responseFactory->create($this->getRequest());
    }
}

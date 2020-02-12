<?php

namespace ElucidateProxy\Controller;

use Elucidate\ClientInterface;
use Elucidate\Exception\ElucidateRequestException;
use Elucidate\Model\Container;
use ElucidateProxy\Domain\ElucidateResponseFactory;
use LogicException;
use Omeka\Mvc\Exception\NotFoundException;
use Throwable;
use Zend\Diactoros\Response\EmptyResponse;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Psr7Bridge\Psr7Response;

class ContainerController extends AbstractActionController
{
    private $elucidate;

    /**
     * @var ElucidateResponseFactory
     */
    private $responseFactory;

    public function __construct(ElucidateResponseFactory $responseFactory, ClientInterface $client)
    {
        $this->elucidate = $client;
        $this->responseFactory = $responseFactory;
    }

    public function getContainerAction()
    {
        $containerId = $this->params()->fromRoute('container');
        if ($query = $this->params()->fromQuery()) {
            $containerId .= '/?'.http_build_query($query).'#';
        }

        try {
            $container = $this->elucidate->getContainer($containerId);
        } catch (ElucidateRequestException $requestException) {
            return Psr7Response::toZend(new EmptyResponse($requestException->getCode()));
        }

        return $this->responseFactory->create($this->getRequest(), $container);
    }

    public function postContainerAction()
    {
        try {
            $container = Container::fromJson($this->getRequest()->getContent());
            if ($this->getRequest()->getHeaders()->has('Slug')) {
                $slug = $this->getRequest()->getHeaders()->get('Slug');
                $container->setHeaders([
                    'Slug' => $slug->getFieldValue(),
                ]);
            }
        } catch (Throwable $e) {
            return $this->responseFactory->create($this->getRequest(), 'Invalid JSON provided', 400);
        }

        $container = $this->elucidate->createContainer($container);

        return $this->responseFactory->create($this->getRequest(), $container);
    }

    public function putContainerAction()
    {
        try {
            $container = Container::fromJson($this->getRequest()->getContent());
        } catch (Throwable $e) {
            return $this->responseFactory->create($this->getRequest(), 'Invalid JSON provided', 400);
        }
        $container->setHeaders($this->getRequest()->getHeaders()->toArray());

        $container = $this->elucidate->updateContainer($container);

        return $this->responseFactory->create($this->getRequest(), $container);
    }

    public function deleteContainerAction()
    {
        $containerId = $this->params()->fromRoute('container');
        $container = new Container(null, $containerId);
        $container->setHeaders($this->getRequest()->getHeaders()->toArray());

        $container = $this->elucidate->deleteContainer($container);

        return $this->responseFactory->create($this->getRequest(), $container);
    }

    public function patchContainerAction()
    {
        throw new LogicException('PATCH /container not implemented');
    }
}

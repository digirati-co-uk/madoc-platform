<?php

namespace ElucidateProxy\Controller;

use Elucidate\ClientInterface;
use Elucidate\Model\Annotation;
use ElucidateProxy\Domain\ElucidateResponseFactory;
use LogicException;
use Omeka\Api\Exception\NotFoundException;
use Throwable;
use Zend\Authentication\AuthenticationServiceInterface;
use Zend\Mvc\Controller\AbstractActionController;

class AnnotationController extends AbstractActionController
{
    private $elucidate;

    /**
     * @var ElucidateResponseFactory
     */
    private $responseFactory;
    /**
     * @var AuthenticationServiceInterface
     */
    private $auth;

    public function __construct(
        ElucidateResponseFactory $responseFactory,
        ClientInterface $client,
        AuthenticationServiceInterface $auth
    ) {
        $this->elucidate = $client;
        $this->responseFactory = $responseFactory;
        $this->auth = $auth;
    }

    public function getAnnotationAction()
    {
        $containerId = $this->params()->fromRoute('container');
        $annotationId = $this->params()->fromRoute('annotation');
        $annotation = $this->elucidate->getAnnotation($containerId, $annotationId);

        return $this->responseFactory->create($this->getRequest(), $annotation);
    }

    public function postAnnotationAction()
    {
        if(!$this->auth->getIdentity()) {
            throw new NotFoundException();
        }

        $containerId = $this->params()->fromRoute('container');

        try {
            $annotation = Annotation::fromJson($this->getRequest()->getContent());
        } catch (Throwable $e) {
            return $this->responseFactory->create($this->getRequest(), 'Invalid JSON provided', 400);
        }

        $annotation->withContainer($containerId);
        $annotation = $this->elucidate->createAnnotation($annotation);

        return $this->responseFactory->create($this->getRequest(), $annotation);
    }

    public function putAnnotationAction()
    {
        if (!$this->auth->getIdentity()) {
            throw new NotFoundException();
        }

        $containerId = $this->params()->fromRoute('container');
        $annotationId = $this->params()->fromRoute('annotation');
        $eTag = $this->params()->fromHeader('If-Match');

        if (!$eTag) {
            $originalAnnotation = $this->elucidate->getAnnotation($containerId, $annotationId);
            $headers = $originalAnnotation->getHeaders();
            if (isset($headers['ETag'][0])) {
                $eTag = substr($headers['ETag'][0], 3, -1);
            }
        } else {
            $eTag = $eTag->getFieldValue();
        }

        try {
            $annotation = Annotation::fromJson($this->getRequest()->getContent());
        } catch (Throwable $e) {
            return $this->responseFactory->create($this->getRequest(), 'Invalid JSON provided', 400);
        }

        /** @var Annotation $annotation */
        $headers = $this->getRequest()->getHeaders()->toArray();
        $headers['If-Match'] = $eTag;
        unset($headers['Host']);
        unset($headers['Location']);
        $annotation = $annotation->withRelativeId()->withContainer($containerId)->setHeaders($headers);
        $annotation = $this->elucidate->updateAnnotation($annotation);

        return $this->responseFactory->create($this->getRequest(), $annotation);
    }

    public function deleteAnnotationAction()
    {
        if (!$this->auth->getIdentity()) {
            throw new NotFoundException();
        }

        $containerId = $this->params()->fromRoute('container');

        try {
            $annotation = Annotation::fromJson($this->getRequest()->getContent());
        } catch (Throwable $e) {
            return $this->responseFactory->create($this->getRequest(), 'Invalid JSON provided', 400);
        }

        $headers = $this->getRequest()->getHeaders()->toArray();
        unset($headers['Host']);
        unset($headers['Location']);

        $annotation->setHeaders($headers);
        $annotation->withContainer($containerId);

        $this->elucidate->deleteAnnotation($annotation);

        return $this->responseFactory->create($this->getRequest());
    }

    public function patchAnnotationAction()
    {
        throw new LogicException('PATCH /annotation not implemented');
    }
}

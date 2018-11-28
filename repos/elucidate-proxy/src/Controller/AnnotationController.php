<?php

namespace ElucidateProxy\Controller;

use Elucidate\ClientInterface;
use Elucidate\Model\Annotation;
use ElucidateProxy\Domain\ElucidateResponseFactory;
use LogicException;
use Throwable;
use Zend\Mvc\Controller\AbstractActionController;

class AnnotationController extends AbstractActionController
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

    public function getAnnotationAction()
    {
        $containerId = $this->params()->fromRoute('container');
        $annotationId = $this->params()->fromRoute('annotation');
        $annotation = $this->elucidate->getAnnotation($containerId, $annotationId);

        return $this->responseFactory->create($this->getRequest(), $annotation);
    }

    public function postAnnotationAction()
    {
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
        $containerId = $this->params()->fromRoute('container');
        $annotationId = $this->params()->fromRoute('annotation');
        $eTag = $this->params()->fromHeader('If-Match');

        if (!$eTag) {
            $originalAnnotation = $this->elucidate->getAnnotation($containerId, $annotationId);
            $headers = $originalAnnotation->getHeaders();
            if (isset($headers['ETag'][0])) {
                $eTag = substr($headers['ETag'][0], 3, -1);
            }
        }

        try {
            $annotation = Annotation::fromJson($this->getRequest()->getContent());
        } catch (Throwable $e) {
            return $this->responseFactory->create($this->getRequest(), 'Invalid JSON provided', 400);
        }

        /** @var Annotation $annotation */
        $headers = $this->getRequest()->getHeaders()->toArray();
        $headers['If-Match'] = $eTag;
        $annotation = $annotation->withRelativeId()->withContainer($containerId)->setHeaders($headers);
        $annotation = $this->elucidate->updateAnnotation($annotation);

        return $this->responseFactory->create($this->getRequest(), $annotation);
    }

    public function deleteAnnotationAction()
    {
        $containerId = $this->params()->fromRoute('container');

        try {
            $annotation = Annotation::fromJson($this->getRequest()->getContent());
        } catch (Throwable $e) {
            return $this->responseFactory->create($this->getRequest(), 'Invalid JSON provided', 400);
        }

        $annotation->setHeaders($this->getRequest()->getHeaders()->toArray());
        $annotation->withContainer($containerId);

        $this->elucidate->deleteAnnotation($annotation);

        return $this->responseFactory->create($this->getRequest());
    }

    public function patchAnnotationAction()
    {
        throw new LogicException('PATCH /annotation not implemented');
    }
}

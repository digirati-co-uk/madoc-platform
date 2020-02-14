<?php

namespace ElucidateModule\Controller;

use ElucidateModule\Form\CommentForm;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\Mvc\Controller\AbstractActionController;

class CommentController extends AbstractActionController
{
    private $dispatcher;

    public function __construct(EventDispatcher $dispatcher)
    {
        $this->dispatcher = $dispatcher;
    }

    public function handleFormAction()
    {
        $request = $this->getRequest();
        if (false === $request->isPost()) {
            return $this->notFoundAction();
        }

        $form = new CommentForm();
        $form->init();
        $form->setData($this->params()->fromPost());
        if (false === $form->isValid()) {
            // Silent fail, should never happen, its a button.
            return $this->redirect()->toUrl('/');
        }
        $data = $form->getData();

        $this->dispatcher->dispatch('content.comment', new GenericEvent($data));

        return $this->redirect()->toUrl($data['redirect']);
    }
}

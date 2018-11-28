<?php

namespace ElucidateModule\Controller;

use ElucidateModule\Form\CompletionForm;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\Mvc\Controller\AbstractActionController;

class CompletionController extends AbstractActionController
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

        $form = new CompletionForm();
        $form->init();
        $form->setData($this->params()->fromPost());
        if (false === $form->isValid()) {
            // Silent fail, should never happen, its a button.
            return $this->redirect()->toUrl('/');
        }
        $data = $form->getData();

        if ('incomplete' === $data['markAs']) {
            $this->dispatcher->dispatch('content.mark_as_incomplete', new GenericEvent($data['subject']));
        } else {
            $this->dispatcher->dispatch('content.mark_as_complete', new GenericEvent($data['subject']));
        }

        return $this->redirect()->toUrl($data['redirect']);
    }
}

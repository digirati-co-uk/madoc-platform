<?php

namespace ElucidateModule\Controller;

use ElucidateModule\Form\FlaggingForm;
use Omeka\Api\Exception\NotFoundException;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class FlaggingController extends AbstractActionController
{
    private $ev;

    public function __construct(EventDispatcher $ev)
    {
        $this->ev = $ev;
    }

    public function formAction()
    {
        $subject = trim($this->params()->fromQuery('subject'));
        $redirect = trim($this->params()->fromQuery('redirect'));
        if (!$subject) {
            throw new NotFoundException();
        }

        if ($this->getRequest()->isPost()) {
            return $this->postAction();
        }
        $form = $this->getForm(FlaggingForm::class);
        $form->setData(['subject' => $subject, 'redirect' => $redirect]);

        $vm = new ViewModel([
            'form' => $form,
        ]);
        $vm->setTemplate('elucidate/flagging/form');

        return $vm;
    }

    public function postAction()
    {
        /** @var FlaggingForm $form */
        $form = $this->getForm(FlaggingForm::class);
        $data = $this->getRequest()->getPost();
        $form->setData($data);

        if (false === $form->isValid()) {
            // @todo
            return null;
        }
        try {
            $this->ev->dispatch('content.flagging', new GenericEvent($data));
        } catch (\Throwable $e) {
            error_log((string) $e);
        }

        return (new ViewModel($data))->setTemplate('elucidate/flagging/post');
    }
}

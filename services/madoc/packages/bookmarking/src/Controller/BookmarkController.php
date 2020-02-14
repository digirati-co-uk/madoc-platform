<?php

namespace Bookmarking\Controller;

use Bookmarking\Event\BookmarkEvent;
use Bookmarking\Form\SimpleBookmarkForm;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Zend\Http\Request;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

/** @method Request getRequest() */
class BookmarkController extends AbstractActionController
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
        // Probably not needed, we have the information we needed.
        $form = new SimpleBookmarkForm();
        $form->init();
        $form->setData($this->params()->fromPost());
        if (false === $form->isValid()) {
            return $this->redirect()->toUrl($form);
        }
        $data = $form->getData();

        /** @var BookmarkEvent $eventResponse */
        $eventResponse = $this->dispatcher->dispatch('iiif.bookmark', new BookmarkEvent($data['subject']));

        if (false === $eventResponse->wasHandled()) {
            return new ViewModel([
                'back' => $data['redirect_to'],
            ]);
        }

        return $this->redirect()->toUrl($data['redirect_to']);
    }
}

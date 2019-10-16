<?php

namespace i18n\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;

class LanguageSelectionController extends AbstractActionController
{
    public function switchAction()
    {
        $sessionContainer = Container::getDefaultManager();
        $session = $sessionContainer->getStorage();
        $session->locale = $this->params()->fromRoute('locale');
        $referrer = $this->params()->fromQuery('r');

        return $this->redirect()->toUrl($referrer);
    }

    public function homeAction()
    {
        $sessionContainer = Container::getDefaultManager();
        $session = $sessionContainer->getStorage();
        $session->locale = $this->params()->fromRoute('locale');
        return $this->redirect()->toUrl('/');
    }
}

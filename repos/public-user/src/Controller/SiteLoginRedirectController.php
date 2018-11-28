<?php

namespace PublicUser\Controller;

use Omeka\Form\LoginForm;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;
use Zend\View\Model\ViewModel;

class SiteLoginRedirectController extends AbstractActionController
{
    public function loginAction()
    {
        $defaultSite = $this->settings()->get('default_site');
        if ($defaultSite) {
            $site = $this->api()->read('sites', $defaultSite)->getContent();

            return $this->redirect()->toRoute('site/publicuser-login',
                [
                    'site-slug' => $site->slug(),
                ]
            );
        }

        // @todo - figure out if we can forward on to another controller.
        // This is not ideal since we need to check if the site admin actually
        // enabled a default site before we attempt to redirect to one.  Not
        // re-implementing login (or forwarding) here would prevent any login UI
        // appearing when default sites are not configured.

        $auth = $this->getEvent()->getApplication()->getServiceManager()->get('Omeka\AuthenticationService');
        if ($auth->hasIdentity()) {
            return $this->redirect()->toRoute('admin');
        }

        $form = $this->getForm(LoginForm::class);

        if ($this->getRequest()->isPost()) {
            $data = $this->getRequest()->getPost();
            $form->setData($data);
            if ($form->isValid()) {
                $sessionManager = Container::getDefaultManager();
                $sessionManager->regenerateId();
                $validatedData = $form->getData();
                $adapter = $auth->getAdapter();
                $adapter->setIdentity($validatedData['email']);
                $adapter->setCredential($validatedData['password']);
                $result = $auth->authenticate();
                if ($result->isValid()) {
                    $this->messenger()->addSuccess('Successfully logged in'); // @translate
                    $session = $sessionManager->getStorage();
                    if ($redirectUrl = $session->offsetGet('redirect_url')) {
                        return $this->redirect()->toUrl($redirectUrl);
                    }

                    return $this->redirect()->toRoute('admin');
                } else {
                    $this->messenger()->addError('Email or password is invalid'); // @translate
                }
            } else {
                $this->messenger()->addFormErrors($form);
            }
        }

        $view = new ViewModel();
        $view->setTemplate('omeka/login/login');
        $view->setVariable('form', $form);

        return $view;
    }
}

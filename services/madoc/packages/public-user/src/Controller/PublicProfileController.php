<?php

namespace PublicUser\Controller;

use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use Digirati\OmekaShared\Helper\SettingsHelper;
use Omeka\Api\Manager;
use Omeka\Api\Representation\UserRepresentation;
use Omeka\Mvc\Exception\NotFoundException;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\Authentication\AuthenticationServiceInterface;
use Zend\View\Model\ViewModel;

class PublicProfileController extends AbstractPsr7ActionController
{

    /**
     * @var SettingsHelper
     */
    private $settings;

    /**
     * @var AuthenticationServiceInterface
     */
    private $auth;

    /**
     * @var EventDispatcher
     */
    private $dispatcher;

    public function __construct(
        SettingsHelper $settings,
        AuthenticationServiceInterface $auth,
        EventDispatcher $dispatcher
    ) {
        $this->settings = $settings;
        $this->auth = $auth;
        $this->dispatcher = $dispatcher;
    }

    public function viewProfileAction()
    {
        if (
            boolval($this->settings->get('public-user-profile-logged-in', true)) &&
            !$this->auth->hasIdentity()
        ) {
            throw new NotFoundException();
        }

        /** @var Manager $api */
        $api = $this->api();

        /** @var UserRepresentation $user */
        $user = $api->read('users', $this->params()->fromRoute('id'))->getContent();
        if (!$user) {
            throw new NotFoundException();
        }

        $viewModel = new ViewModel();


        $viewModel->setVariable('name', $user->name());
        $viewModel->setVariable('role', $user->displayRole());

        if (
            boolval($this->settings->get('public-user-profile-email', false)) &&
            $this->auth->hasIdentity()
        ) {
            $viewModel->setVariable('email', $user->email());
        }

        $this->dispatcher->dispatch('public-user.public-profile.view', new GenericEvent(['viewModel' => $viewModel, 'user' => $user]));

        return $viewModel;
    }

}

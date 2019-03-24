<?php

namespace PublicUser\Controller;

use DateTime;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use LogicException;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\User;
use Omeka\Form\ActivateForm;
use Omeka\Form\ForgotPasswordForm;
use Omeka\Form\LoginForm;
use Omeka\Form\UserForm;
use Omeka\I18n\Translator;
use Omeka\Mvc\Controller\Plugin\Mailer;
use Omeka\Permissions\Acl;
use Omeka\Settings\Settings;
use Omeka\Stdlib\Message;
use PublicUser\Entity\SitePermission;
use PublicUser\Exception\BlacklistedEmailException;
use PublicUser\Extension\ConfigurableMailer;
use PublicUser\Settings\PublicUserSettings;
use RuntimeException;
use Throwable;
use Zend\Authentication\AuthenticationService;
use Zend\Authentication\Validator\Authentication;
use Zend\Form\Element\Hidden;
use Zend\Form\Form;
use Zend\Http\Response;
use Zend\I18n\View\Helper\AbstractTranslatorHelper;
use Zend\Log\Logger;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;
use Zend\Uri\Uri;
use Zend\View\Helper\TranslatorAwareTrait;
use Zend\View\Model\ViewModel;
use Omeka\Mvc\Controller\Plugin\Messenger;

/**
 * Class LoginController.
 *
 * @method LoginForm getForm($className)
 * @method getPost()
 * @method Messenger messenger()
 * @method Mailer mailer()
 * @method SiteRepresentation currentSite()
 * @method translate
 */
class LoginController extends AbstractActionController
{
    /**
     * @var EntityManager
     */
    protected $entityManager;
    /**
     * @var AuthenticationService
     */
    protected $auth;
    /**
     * @var Logger
     */
    protected $logger;

    /**
     * @var PublicUserSettings
     */
    private $userSettings;
    /**
     * @var ConfigurableMailer
     */
    private $mailer;
    /**
     * @var Acl
     */
    private $acl;

    /**
     * @param EntityManager $entityManager
     * @param AuthenticationService $auth
     * @param PublicUserSettings $userSettings
     * @param Logger $logger
     * @param ConfigurableMailer $mailer
     * @param Acl $acl
     */
    public function __construct(
        EntityManager $entityManager,
        AuthenticationService $auth,
        PublicUserSettings $userSettings,
        Logger $logger,
        ConfigurableMailer $mailer,
        Acl $acl
    ) {
        $this->entityManager = $entityManager;
        $this->auth = $auth;
        $this->logger = $logger;
        $this->userSettings = $userSettings;
        $this->mailer = $mailer;
        $this->acl = $acl;
    }

    public function loginAction()
    {
        // This logic is a bit crappy and disjointed, so here's what it's trying to do:
        //
        // 1. Check for a Referer header and assign that as the redirect URI.
        // 2. Is the referer path identical to the current login path?  If so, remove the header.
        // 3. Set the post-login redirect to the value of the referer header.
        //  a. OR if that isn't set: the value set to the 'redirect' in the admin settings
        //  b. OR if that isn't set: the root page of the current site (will always exist)
        // 4. Stuff that URI into the login form and use it as the source of truth for redirects.
        if ($this->auth->getIdentity()) {
            return $this->redirect()->toUrl($this->url()->fromRoute('site', [], [], true));
        }

        $site = $this->currentSite();
        $referer = $this->getRequest()->getHeader('Referer');

        if ($referer) {
            $referer = $referer->uri()->getPath();
        }

        $siteUri = $this->url()->fromRoute('site', [], [], true);
        $currentUri = $this->url()->fromRoute(null, [], [], true);
        $redirectUri = $this->params()->fromQuery('redirect');
        if (!$redirectUri) {
            $redirectUri = (string)$referer ?: $this->userSettings->getUserLoginRedirect();
        }

        if ($redirectUri === $currentUri) {
            $redirectUri = new Uri($siteUri);
        }

        if ($this->auth->hasIdentity()) {
            return $this->redirect()->toUrl($redirectUri);
        }

        /** @var LoginForm $form */
        $form = $this->getForm(LoginForm::class);
        $redirectInput = new Hidden('redir');
        $redirectInput->setValue($redirectUri);
        $form->add($redirectInput);

        if ($this->getRequest()->isPost()) {
            $data = $this->getRequest()->getPost();

            $form->setData($data);
            if ($form->isValid()) {
                $sessionManager = Container::getDefaultManager();
                $sessionManager->regenerateId();
                $validatedData = $form->getData();
                /** @var Authentication $adapter */
                $adapter = $this->auth->getAdapter();
                $adapter->setIdentity($validatedData['email']);
                $adapter->setCredential($validatedData['password']);
                $result = $this->auth->authenticate();
                if ($result->isValid()) {
                    $this->messenger()->addSuccess($this->translate('You have successfully logged in')); // @translate
                    return $this->redirect()->toUrl($data['redir'] ? $data['redir'] : $redirectUri);
                }
                $this->messenger()->addError($this->translate('Your email or password is invalid')); // @translate
            }
            $this->messenger()->addFormErrors($form);
        }

        $view = new ViewModel();
        $view->setVariable('form', $form);

        $page = $this->api()->read('site_pages',
            [
                'slug' => 'login',
                'site' => $site->id(),
            ]
        )->getContent();

        $view->setVariable('site', $site);
        $view->setVariable('page', $page);
        $view->setVariable('displayNavigation', true);

        $contentView = clone $view;
        $contentView->setTemplate('omeka/site/page/content');
        $contentView->setVariable('pageViewModel', $view);

        $view->addChild($contentView, 'content');

        return $view;
    }

    public function logoutAction()
    {
        $redirection_config_value = $this->userSettings->getUserLoginRedirect();
        $login_redirect = $this->getRedirectFromSettings($redirection_config_value);

        $this->auth->clearIdentity();
        $sessionManager = Container::getDefaultManager();
        $sessionManager->destroy();
        $this->messenger()->addSuccess('You have logged out'); // @translate

        return $this->redirect()->toUrl($login_redirect);
    }

    public function getRedirectFromSettings($setting): string
    {
        // Root of the site.
        $default = $this->url()->fromRoute('site', [], [], true);

        // No setting, return.
        if (!$setting) {
            return $default;
        }

        // No slash at the beginning, return.
        if ('/' !== substr($setting, 0, 1)) {
            $setting = '/'.$setting;
        }

        // Slash at the end? No nginx, return.
        if ('/' === substr($setting, -1, 1)) {
            $setting = substr($setting, 0, -1);
        }

        // reacquaint.
        return $default.$setting;
    }

    /**
     * @param SiteRepresentation $site
     * @param Form $form
     *
     * @return Response
     *
     * @throws OptimisticLockException
     * @throws BlacklistedEmailException
     * @throws RuntimeException
     * @throws \Doctrine\ORM\ORMException
     */
    private function registerUser(
        SiteRepresentation $site,
        Form $form
    ) {
        $role = $this->userSettings->getDefaultUserRole();
        $active = $this->userSettings->isActivationAutomatic();
        $form->setData($this->params()->fromPost());

        if (!$form->isValid()) {
            throw new RuntimeException('Invalid registration details');
        }
        $formData = $form->getData();
        if ($this->userSettings->isEmailBlacklisted($formData['user-information']['o:email'])) {
            throw new BlacklistedEmailException();
        }

        $userResponse = $this->api()->searchOne('users',
            [
                'email' => $formData['user-information']['o:email']
            ]
        );

        $userDetails = $userResponse->getContent();
        if ($userDetails) {
            throw new RuntimeException('There is already an account registered with your email');
        }

        $formData['user-information']['o:role'] = $role;
        $formData['user-information']['o:is_active'] = $active;

        // Permissions.
        /** @var Acl $acl */
        $this->acl->allow(null, ['Omeka\Entity\User']);

        $response = $this->api($form)->create('users', $formData['user-information']);
        /** @var User $user */
        $user = $response->getContent()->getEntity();
        $this->entityManager->flush();

        $this->acl->removeAllow(null, ['Omeka\Controller\Admin\User']);

        if (
            $this->userSettings->isActivationAutomatic() &&
            isset($formData['change-password']) &&
            isset($formData['change-password']['password'])
        ) {
            $user->setPassword($formData['change-password']['password']);
        } else {
            try {
                $this->mailer->sendUserActivation($user);
            } catch (Throwable $e) {
                $this->logger->err($e->getMessage());
            }
        }

        $perms = new SitePermission();
        $perms->setSite($site->id());
        $perms->setUser($user->getId());
        $perms->setRole('viewer');

        $this->entityManager->persist($perms);
        $this->entityManager->flush();

        $message = new Message(
            $this->translate('User successfully created.')
        );
        $message->setEscapeHtml(false);
        $this->messenger()->addSuccess($message);

        return $this->redirect()->toUrl('register/thank-you');
    }

    public function registerAction()
    {
        if ($this->auth->getIdentity()) {
            return $this->redirect()->toUrl($this->url()->fromRoute('site', [], [], true));
        }
        $site = $this->currentSite();

        if (!$this->userSettings->isRegistrationPermitted()) {
            $this->response->setStatusCode(Response::STATUS_CODE_404);
        }

        $form = $this->getForm(UserForm::class,
            [
                'include_role' => false,
                'include_password' => $this->userSettings->isActivationAutomatic(),
            ]
        );

        $form->prepare();

        if ($this->getRequest()->isPost()) {
            try {
                return $this->registerUser($site, $form);
            } catch (BlacklistedEmailException $e) {
                error_log((string) $e);
                $this->messenger()->addError(
                    $this->translate('Your email address has been blacklisted') // @translate
                );
            } catch (RuntimeException $e) {
                error_log((string) $e);
                $this->messenger()->addError(
                    $this->translate($e->getMessage()) // @translate
                );
            } catch (Throwable $e) {
                error_log((string) $e);
                $this->messenger()->addError(
                    $this->translate('Something went wrong, please try registering again') // @translate
                );
            } finally {
                $this->messenger()->addFormErrors($form);
            }
        }

        $form->add([
            'name' => 'submit',
            'type' => 'Submit',
            'attributes' => [
                'value' => 'Register',
                'id' => 'submitbutton',
            ],
        ]);

        $view = new ViewModel();
        $view->setVariable('form', $form);

        $page = $this->api()->read('site_pages',
            [
                'slug' => 'register',
                'site' => $site->id(),
            ])->getContent();

        $view->setVariable('site', $site);
        $view->setVariable('page', $page);
        $view->setVariable('displayNavigation', true);

        $contentView = clone $view;
        $contentView->setTemplate('omeka/site/page/content');
        $contentView->setVariable('pageViewModel', $view);

        $view->addChild($contentView, 'content');

        return $view;
    }

    public function forgotPasswordAction()
    {
        $site = $this->currentSite();
        if ($this->auth->hasIdentity()) {
            $linkedPages = $site->linkedPages();
            $firstPage = current($linkedPages);

            return $this->redirect()->toRoute('site/page',
                [
                    'site-slug' => $site->slug(),
                    'page-slug' => $firstPage->slug(),
                ]);
        }

        $form = $this->getForm(ForgotPasswordForm::class);

        if ($this->getRequest()->isPost()) {
            $data = $this->getRequest()->getPost();
            $form->setData($data);
            if ($form->isValid()) {
                $user = $this->entityManager->getRepository('Omeka\Entity\User')
                    ->findOneBy([
                        'email' => $data['email'],
                        'isActive' => true,
                    ]);
                if ($user) {
                    $passwordCreation = $this->entityManager
                        ->getRepository('Omeka\Entity\PasswordCreation')
                        ->findOneBy(['user' => $user]);
                    if ($passwordCreation) {
                        $this->entityManager->remove($passwordCreation);
                        $this->entityManager->flush();
                    }
                    $this->mailer->sendResetPassword($user); // todo
                }
                $this->messenger()->addSuccess('Check your email for instructions on how to reset your password'); // @translate
                return $this->redirect()->toRoute('login');
            } else {
                $this->messenger()->addError('Something went wrong. Did you enter the right email address?'); // @translate
            }
        }

        $form->add([
            'name' => 'submit',
            'type' => 'Submit',
            'attributes' => [
                'value' => 'Submit',
                'id' => 'submitbutton',
            ],
        ]);

        $view = new ViewModel();
        $view->setVariable('form', $form);
        $view->setVariable('site', $site);

        return $view;
    }

    public function resetPasswordAction()
    {
        throw new LogicException('Action not yet implemented');
    }

    public function thanksAction()
    {
        $site = $this->currentSite();

        $view = new ViewModel([
            'site' => $site,
            'activated' => $this->userSettings->isActivationAutomatic(),
        ]);

        return $view;
    }

    public function createPasswordAction()
    {
        if ($this->auth->hasIdentity()) {
            return $this->redirect()->toUrl('/');
        }

        $passwordCreation = $this->entityManager->find(
            'Omeka\Entity\PasswordCreation',
            $this->params('key')
        );

        if (!$passwordCreation) {
            $this->messenger()->addError('Invalid password creation key.'); // @translate
            return $this->redirect()->toRoute('login');
        }
        $user = $passwordCreation->getUser();

        try {
            if (new DateTime() > $passwordCreation->getExpiration()) {
                $user->setIsActive(false);
                $this->entityManager->remove($passwordCreation);
                $this->entityManager->flush();
                $this->messenger()->addError('Password creation key expired.'); // @translate
                return $this->redirect()->toRoute('login');
            }
        } catch (OptimisticLockException $e) {
            $this->messenger()->addError('Something went wrong.'); // @translate
            return $this->redirect()->toRoute('login');
        } catch (ORMException $e) {
            return $this->redirect()->toRoute('login');
        }

        $form = $this->getForm(ActivateForm::class);

        if ($this->getRequest()->isPost()) {
            $data = $this->getRequest()->getPost();
            $form->setData($data);
            if ($form->isValid()) {
                $user->setPassword($data['password']);
                if ($passwordCreation->activate()) {
                    $user->setIsActive(true);
                }
                $this->entityManager->remove($passwordCreation);
                $this->entityManager->flush();
                $this->messenger()->addSuccess('Successfully created your password. Please log in.'); // @translate
                return $this->redirect()->toRoute('login');
            } else {
                $this->messenger()->addError('Password creation unsuccessful'); // @translate
            }
        }

        $view = new ViewModel();
        $view->setVariable('form', $form);
        $view->setTemplate('omeka/login/create-password');

        return $view;
    }
}

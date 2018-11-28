<?php

namespace PublicUser\Extension;

use Doctrine\ORM\EntityManager;
use Omeka\Entity\User;
use PublicUser\Settings\PublicUserSettings;
use Zend\Mail\Transport\TransportInterface;
use Zend\View\HelperPluginManager;
use Omeka\Stdlib\Mailer;

class ConfigurableMailer extends Mailer
{
    /**
     * @var TransportInterface
     */
    protected $transport;

    /**
     * @var HelperPluginManager
     */
    protected $viewHelpers;

    /**
     * @var EntityManager
     */
    protected $entityManager;

    /**
     * @var array
     */
    protected $defaultOptions;

    /**
     * @var string
     */
    private $resetPasswordCopy;

    /**
     * @var string
     */
    private $resetPasswordSubject;

    /**
     * @var string
     */
    private $userActivationCopy;

    /**
     * @var string
     */
    private $userActivationSubject;

    /**
     * @var PublicUserSettings
     */
    private $settings;

    /**
     * Set the transport and message defaults.
     *
     *
     *
     * @var TransportInterface
     *
     * @param HelperPluginManager $viewHelpers
     * @param EntityManager       $entityManager
     *
     * @var array $defaultOptions
     *
     * @param PublicUserSettings $settings
     */
    public function __construct(
        TransportInterface $transport,
        HelperPluginManager $viewHelpers,
        EntityManager $entityManager,
        array $defaultOptions = [],
        PublicUserSettings $settings
    ) {
        parent::__construct($transport, $viewHelpers, $entityManager, $defaultOptions);
        $this->settings = $settings;

        $resetPassword = $this->settings->getPasswordResetEmailTemplate();
        $this->resetPasswordSubject = $resetPassword['subject'] ?? 'Reset your password for %s';
        $this->resetPasswordCopy = $resetPassword['copy'] ??
            'Greetings, %1$s!

It seems you have forgotten your password for %5$s at %2$s

To reset your password, click this link:
%3$s

Your reset link will expire on %4$s.';

        $userActivation = $this->settings->getActivationEmailTemplate();
        $this->userActivationSubject = $userActivation['subject'] ?? 'User activation for %s';
        $this->userActivationCopy = $userActivation['copy'] ??
            'Greetings!

A user has been created for you on %5$s at %1$s

Your username is your email: %2$s

Click this link to set a password and begin using Omeka S:
%3$s

Your activation link will expire on %4$s. If you have not completed the user activation process by the time the link expires, you will need to request another activation email from your site administrator.';
    }

    /**
     * Send a reset password email.
     *
     * @param User $user
     */
    public function sendResetPassword(User $user)
    {
        $translate = $this->viewHelpers->get('translate');
        $installationTitle = $this->getInstallationTitle();
        $template = $translate($this->resetPasswordCopy);

        $passwordCreation = $this->getPasswordCreation($user, false);
        $body = sprintf(
            $template,
            $user->getName(),
            $this->getSiteUrl(),
            $this->getCreatePasswordUrl($passwordCreation),
            $this->getExpiration($passwordCreation),
            $installationTitle
        );

        $message = $this->createMessage();
        $message->addTo($user->getEmail(), $user->getName())
            ->setSubject(sprintf(
                $translate($this->resetPasswordSubject),
                $installationTitle
            ))
            ->setBody($body);
        $this->send($message);
    }

    /**
     * Send a user activation email.
     *
     * @param User $user
     */
    public function sendUserActivation(User $user)
    {
        $translate = $this->viewHelpers->get('translate');
        $installationTitle = $this->getInstallationTitle();
        $template = $translate($this->userActivationCopy);

        $passwordCreation = $this->getPasswordCreation($user, true);
        $body = sprintf(
            $template,
            $this->getSiteUrl(),
            $user->getEmail(),
            $this->getCreatePasswordUrl($passwordCreation),
            $this->getExpiration($passwordCreation),
            $installationTitle
        );

        $message = $this->createMessage();
        $message->addTo($user->getEmail(), $user->getName())
            ->setSubject(sprintf(
                $translate($this->userActivationSubject),
                $installationTitle
            ))
            ->setBody($body);
        $this->send($message);
    }
}

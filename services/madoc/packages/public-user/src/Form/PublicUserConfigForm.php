<?php

namespace PublicUser\Form;

use Omeka\Form\Element\ResourceSelect;
use Zend\EventManager\EventManagerAwareTrait;
use Zend\Form\Element\Checkbox;
use Zend\Form\Element\Select;
use Zend\Form\Element\Text;
use Zend\Form\Element\Textarea;
use Zend\Form\Fieldset;
use Zend\Form\Form;
use Zend\View\Helper\Url;

class PublicUserConfigForm extends Form
{
    use EventManagerAwareTrait;

    protected $globalSettings;

    protected $sites;

    protected $roles;

    private $urlHelper;

    private $apiManager;

    public function __construct($name = null, array $options = [])
    {
        parent::__construct($name, $options);
    }

    public function init()
    {
        $urlHelper = $this->getUrlHelper();

        $this->sites = $this->getOption('sites');
        $this->roles = $this->getOption('roles');

        $profilesEnabledCheckbox = new Checkbox('__global__user_profiles_enabled', [
            'label' => 'Enable user profiles?',
            'info' => 'Allow users to customize their profiles by selecting a pre-defined resource template to use'.
                ' as an input form.',
        ]);
        $profilesEnabledCheckbox->setValue($this->options['settings']['__global__']['user_profiles_enabled'] ?? false);

        $userResetPasswordSubject = new Text('__global__user_reset_password_subject', [
            'label' => 'Reset password email subject',
        ]);
        $userResetPasswordSubject->setValue(
            $this->options['settings']['__global__']['user_reset_password_subject'] ??
            'Reset your password for %s'
        );
        $userResetPasswordCopy = new Textarea('__global__user_reset_password_copy', [
            'label' => 'Reset password email template',
        ]);
        $userResetPasswordCopy->setValue(
            $this->options['settings']['__global__']['user_reset_password_copy'] ??
            'Greetings, %1$s!

It seems you have forgotten your password for %5$s at %2$s

To reset your password, click this link:
%3$s

Your reset link will expire on %4$s.'
        );
        $userResetPasswordCopy->setAttribute('rows', 8);
        $userResetPasswordCopy->setAttribute('style', 'max-height: initial');

        $userActivationSubject = new Text('__global__user_activation_subject', [
            'label' => 'Activation email subject',
        ]);
        $userActivationSubject->setValue(
            $this->options['settings']['__global__']['user_activation_subject'] ??
            'User activation for %s'
        );

        $userActivationCopy = new Textarea('__global__user_activation_copy', [
            'label' => 'Activation email template',
        ]);
        $userActivationCopy->setAttribute('rows', 11);
        $userActivationCopy->setAttribute('style', 'max-height: initial');
        $userActivationCopy->setValue(
            $this->options['settings']['__global__']['user_activation_copy'] ??
            'Greetings!

A user has been created for you on %5$s at %1$s

Your username is your email: %2$s

Click this link to set a password and begin using Omeka S:
%3$s

Your activation link will expire on %4$s. If you have not completed the user activation process by the time the link expires, you will need to request another activation email from your site administrator.'
        );

        // Configurable mail templates
        $emailBlacklist = new Textarea('__global__email_blacklist', [
            'label' => 'Email blacklist (one per line)',
            'info' => 'List of domain names to be excluded from registration.',
        ]);
        $emailBlacklist->setValue($this->options['settings']['__global__']['email_blacklist'] ?? '');

        $resourceTemplate = new ResourceSelect('__global__user_profiles_resource_template');
        $resourceTemplate->setApiManager($this->apiManager);
        $resourceTemplate->setAttributes([
            'required' => false,
            'id' => 'resource-template-select',
            'class' => 'chosen-select',
            'data-placeholder' => 'Select a template', // @translate
            'data-api-base-url' => $urlHelper('api/default', ['resource' => 'resource_templates']),
        ]);

        $resourceTemplate->setValue($this->options['settings']['__global__']['user_profiles_resource_template'] ?? false);
        $resourceTemplate->setOptions([
            'label' => 'User profile template', // @translate
            'info' => 'A pre-defined template for user profile creation.', // @translate
            'empty_option' => '',
            'resource_value_options' => [
                'resource' => 'resource_templates',
                'query' => [],
                'option_text_callback' => function ($resourceTemplate) {
                    return $resourceTemplate->label();
                },
            ],
        ]);

        $globalConfig = new Fieldset('__global__');
        $globalConfig->add($profilesEnabledCheckbox);
        $globalConfig->add($resourceTemplate);
        $globalConfig->add($emailBlacklist);
        $globalConfig->add($userActivationSubject);
        $globalConfig->add($userActivationCopy);
        $globalConfig->add($userResetPasswordSubject);
        $globalConfig->add($userResetPasswordCopy);
        $this->add($globalConfig);

    }

    public function castBool($value)
    {
        if (is_string($value)) {
            return strtolower($value) === 'true';
        }
        return (bool) $value;
    }

    /**
     * @return Url
     */
    public function getUrlHelper()
    {
        return $this->urlHelper;
    }

    /**
     * @param Url $urlHelper
     */
    public function setUrlHelper(Url $urlHelper)
    {
        $this->urlHelper = $urlHelper;
    }

    public function setApiManager($apiManager)
    {
        $this->apiManager = $apiManager;
    }
}

<?php


namespace PublicUser\Module;


use Omeka\Form\SiteSettingsForm;
use Zend\Form\Element\Checkbox;
use Zend\Form\Element\Select;
use Zend\Form\Element\Text;
use Zend\Form\Fieldset;

trait SiteSettingExtension
{

    public function createCheckbox(SiteSettingsForm $form, string $id, string $label, bool $default = true)
    {
        return (new Checkbox($id))
            ->setOptions([
                'label' => $label,
            ])
            ->setValue($form->getSiteSettings()->get($id, $default));
    }

    public function extendSiteSettings(SiteSettingsForm $form)
    {
        $form->add(
            (new Fieldset('public-user'))
                ->add(
                    (new Checkbox('public-user-enable-registration'))
                        ->setOptions([
                            'label' => 'Registrations', // @translate
                            'info' => 'Enable user registrations on this site' // @translate
                        ])
                        ->setValue($form->getSiteSettings()->get('public-user-enable-registration', false))
                )
                ->add(
                    (new Checkbox('public-user-invite-only'))
                        ->setOptions([
                            'label' => 'Invite only', // @translate
                            'info' => 'Registrations are invite only, only users who have been invited may register', // @translate
                        ])
                        ->setValue($form->getSiteSettings()->get('public-user-invite-only', false))
                )
                ->add(
                    (new Checkbox('public-user-automatic-activation'))
                        ->setOptions([
                            'label' => 'Automatically activate users', // @translate
                            'info' => 'If false, when a user registers they will have to confirm their email' // @translate
                        ])
                        ->setValue($form->getSiteSettings()->get('public-user-automatic-activation', false))
                )
                ->add(
                    (new Text('public-user-login-redirect'))
                        ->setOptions([
                            'label' => 'Login redirection location', // @translate
                            'info' => 'Where will the user end up after logging in' // @translate
                        ])
                        ->setValue($form->getSiteSettings()->get('public-user-login-redirect', ''))
                )
                ->add(
                    (new Select('public-user-registration-role'))
                        ->setOptions([
                            'label' => 'New user role', // @translate
                            'info' => 'The user role for users when registering' // @translate
                        ])
                        ->setValueOptions([
                            // This can only be transcriber for the time being.
                            'Transcriber' => 'Transcriber'
                        ])
                        ->setValue($form->getSiteSettings()->get('public-user-registration-role', 'Transcriber'))
                )
                ->add(
                    (new Checkbox('public-user-profile-logged-in'))
                        ->setOptions([
                            'label' => 'Semi-public profile', // @translate
                            'info' => 'Only show user profiles for logged in users, otherwise for all visitors', // @translate
                        ])
                        ->setValue($form->getSiteSettings()->get('public-user-profile-logged-in', false))
                )
                ->add(
                    (new Checkbox('public-user-profile-email'))
                        ->setOptions([
                            'label' => 'Show email on public profile', // @translate
                            'info' => 'Shows the users email on their public profile', // @translate
                        ])
                        ->setValue($form->getSiteSettings()->get('public-user-profile-email', false))
                )
                ->setOptions([
                    'label' => 'Public user options', // @translate
                ])
        );

        // Permissions.
        $form
            ->add(
                (new Fieldset('public-user-site-permissions-viewer', [
                    'label' => 'Permissions (Role: viewers)', // @translate
                ]))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-viewer-view-canvas',
                        'Can viewers see individual canvas pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-viewer-view-manifest',
                        'Can viewers see individual manifest pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-viewer-view-collection',
                        'Can viewers see individual collection pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-viewer-view-all-collections',
                        'Can viewers see all collections page' // @translate
                    ))
                ->setAttribute('id', 'viewer-permissions')
            )
            ->add(
                (new Fieldset('public-user-site-permissions-limited-transcriber', [
                    'label' => 'Permissions (Role: limited transcriber)', // @translate
                ]))
                    // Limited transcriber
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-limited-transcriber-view-canvas',
                        'Can limited transcribers see individual canvas pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-limited-transcriber-view-manifest',
                        'Can limited transcribers see individual manifest pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-limited-transcriber-view-collection',
                        'Can limited transcribers see individual collection pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-limited-transcriber-view-all-collections',
                        'Can limited transcribers see all collections page' // @translate
                    ))
                    ->setAttribute('id', 'limited-transcriber-permissions')
            )
            ->add(
                (new Fieldset('public-user-site-permissions-transcriber', [
                    'label' => 'Permissions (Role: transcriber)', // @translate
                ]))
                    // Limited transcriber
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-transcriber-view-canvas',
                        'Can limited transcribers see individual canvas pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-transcriber-view-manifest',
                        'Can limited transcribers see individual manifest pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-transcriber-view-collection',
                        'Can limited transcribers see individual collection pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-transcriber-view-all-collections',
                        'Can limited transcribers see all collections page' // @translate
                    ))
                    ->setAttribute('id', 'transcriber-permissions')
            )
            ->add(
                (new Fieldset('public-user-site-permissions-limited-reviewer', [
                    'label' => 'Permissions (Role: limited reviewer)', // @translate
                ]))
                    // Limited reviewers
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-limited-reviewer-view-canvas',
                        'Can limited reviewers see individual canvas pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-limited-reviewer-view-manifest',
                        'Can limited reviewers see individual manifest pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-limited-reviewer-view-collection',
                        'Can limited reviewers see individual collection pages' // @translate
                    ))
                    ->add($this->createCheckbox(
                        $form,
                        'public-user-site-permissions-limited-reviewer-view-all-collections',
                        'Can limited reviewers see all collections page' // @translate
                    ))
                    ->setAttribute('id', 'limited-reviewer-permissions')
            );
    }
}

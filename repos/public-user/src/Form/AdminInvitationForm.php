<?php

namespace PublicUser\Form;

use PublicUser\Settings\PublicUserSettings;
use Zend\Form\Element\Select;
use Zend\Form\Element\Submit;
use Zend\Form\Element\Textarea;
use Zend\Form\Form;

class AdminInvitationForm extends Form
{
    public function init()
    {
        $this->add(
            (new Textarea('message', [
                'label' => 'Message to user', // @translate
                'info' => 'This message will appear on your invitation page when you share the link', // @translate
            ]))->setAttribute('rows', 10)
        );
        $this->add(
            (new Select('site-role'))
                ->setOptions([
                    'label' => 'Site role', // @translate
                    'info' => 'The user role for users when registering' // @translate
                ])
                ->setValueOptions(PublicUserSettings::ADDITIONAL_ROLES)
                ->setValue('viewer')
        );
        $this->add(
            (new Submit('generate-invitation', [
                'label' => 'Generate invitation', // @translate
                'info' => 'Create a new link that can be used to invite users to your site', // @translate
            ]))->setValue('Generate invitation')
        );
    }
}

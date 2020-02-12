<?php

namespace PublicUser\Form;


use Zend\Form\Element\Hidden;
use Zend\Form\Element\Submit;
use Zend\Form\Form;

class AuthTokenForm extends Form
{
    public function init()
    {
        $this->add(new Hidden('response_type'));
        $this->add(new Hidden('client_id'));
        $this->add(new Hidden('redirect_uri'));
        $this->add(new Hidden('scope'));
        $this->add(new Hidden('state'));
        $this->add(new Hidden('hash'));
        $this->add(
            (new Submit('deny'))
                ->setValue('Deny')
        );
        $this->add(
            (new Submit('allow'))
            ->setValue('Allow')
        );
    }

    public function isValid()
    {
        $valid = parent::isValid();
        if (!$valid) {
            return false;
        }
        $data = $this->getData();

        return isset($data['allow']) && $data['allow'] !== '';
    }
}

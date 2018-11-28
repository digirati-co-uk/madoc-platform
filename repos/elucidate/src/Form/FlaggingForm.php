<?php

namespace ElucidateModule\Form;

use Zend\Form\Element\Hidden;
use Zend\Form\Element\Select;
use Zend\Form\Element\Textarea;
use Zend\Form\Form;

class FlaggingForm extends Form
{
    public function init()
    {
        $this->add(
            (new Select('reason', [
                'label' => 'Select reason for flagging',
                'options' => [
                    'offensive' => 'Mark as offensive',
                    'incorrect' => 'Mark as incorrect',
                    'deviation' => 'Mark as irrelevant',
                ],
            ]))->setAttribute('required', true)
        );

        $this->add(
            (new Hidden('subject'))
        );

        $this->add(
            (new Hidden('redirect'))
        );

        $this->add(
            (new Textarea('detail', [
                'label' => 'Further information',
            ]))
        );

        $this->add([
            'name' => 'submit',
            'type' => 'Submit',
            'attributes' => [
                'value' => 'Flag',
            ],
        ]);
    }
}

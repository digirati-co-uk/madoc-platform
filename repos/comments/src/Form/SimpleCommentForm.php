<?php

namespace Comments\Form;

use Zend\Form\Element\Hidden;
use Zend\Form\Element\Textarea;
use Zend\Form\Form;

class SimpleCommentForm extends Form implements CommentForm
{
    public function init()
    {
        $this->add(
            (new Textarea('comment', [
                'label' => 'leave comment',
            ]))->setAttribute('required', true)
        );

        $this->add([
            'name' => 'submit',
            'type' => 'Submit',
            'attributes' => [
                'value' => 'post comment',
            ],
        ]);
    }

    public function setRedirect(string $uri)
    {
        $this->add(
            (new Hidden('redirect'))->setAttribute('value', $uri)
        );
    }
}

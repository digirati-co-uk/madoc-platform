<?php

namespace ElucidateModule\Form;

use Zend\Form\Element\Hidden;
use Zend\Form\Form;

class CompletionForm extends Form
{
    private $completionStatus = false;
    private $subjectName = 'page';
    private $redirect;

    public function withCompletionStatus(bool $status)
    {
        $this->completionStatus = $status;

        return $this;
    }

    public function withSubjectName(string $text)
    {
        $this->subjectName = $text;

        return $this;
    }

    public function withRedirect($redirect)
    {
        $this->setData([
            'redirect' => $redirect,
        ]);

        return $this;
    }

    public function init()
    {
        $this->add(
            (new Hidden('subject'))
        );

        $this->add(
            (new Hidden('redirect'))->setValue($this->redirect)
        );

        $this->add(
            (new Hidden('markAs'))->setValue($this->completionStatus ? 'incomplete' : 'complete')
        );

        $this->add([
            'name' => 'submit',
            'type' => 'Submit',
            'attributes' => [
                'value' => true === $this->completionStatus ?
                    sprintf('Mark %s as incomplete', $this->subjectName) : // @translate
                    sprintf('Mark %s as complete', $this->subjectName), // @translate
            ],
        ]);
    }

    public static function create(string $subject, bool $isComplete, string $endpoint = '/service/mark-complete')
    {
        $form = new static();
        $form->withCompletionStatus($isComplete)->init();
        $form->populateValues([
            'subject' => $subject,
        ]);
        if ($endpoint) {
            $form->setAttribute('action', $endpoint);
        }

        return $form;
    }
}

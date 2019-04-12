<?php

namespace ElucidateModule\Form;

use IIIF\Model\Manifest;
use Zend\Form\Element\Hidden;
use Zend\Form\Element\Textarea;
use Zend\Form\Form;

class CommentForm extends Form
{
    private $buttonText = 'Post comment'; // @translate
    private $commentLabel = 'Leave a comment'; // @translate

    public function withRedirect($redirect)
    {
        $this->setData([
            'redirect' => $redirect,
        ]);

        return $this;
    }

    public function withLabel(string $label)
    {
        $this->commentLabel = $label;

        return $this;
    }

    public function withManifest($manifest)
    {
        if ($manifest instanceof Manifest) {
            $this->setData([
                'part-of' => $manifest->getId(),
            ]);
        } elseif (is_string($manifest)) {
            $this->setData([
                'part-of' => $manifest,
            ]);
        }

        return $this;
    }

    public function withButtonText(string $buttonText)
    {
        $this->buttonText = $buttonText;

        return $this;
    }

    public function init()
    {
        $this->add(
            (new Hidden('subject'))
        );

        $this->add(
            (new Hidden('redirect'))
        );

        $this->add(
            (new Hidden('part-of'))
        );

        $this->add(
            (new Textarea('comment', [
                'label' => $this->commentLabel,
            ]))
        );

        $this->add([
            'name' => 'submit',
            'type' => 'Submit',
            'attributes' => [
                'value' => $this->buttonText,
            ],
        ]);
    }

    public static function create(string $subject, string $endpoint = '/service/comment', string $buttonLabel = null, string $label = null)
    {
        $form = new static();
        if ($buttonLabel) {
            $form->withButtonText($buttonLabel);
        }
        if ($label) {
            $form->withLabel($label);
        }
        $form->init();
        $form->populateValues([
            'subject' => $subject,
        ]);
        if ($endpoint) {
            $form->setAttribute('action', $endpoint);
        }

        return $form;
    }
}

<?php

namespace Bookmarking\Form;

use Zend\Form\Element\Hidden;
use Zend\Form\Element\Submit;
use Zend\Form\Form;

class SimpleBookmarkForm extends Form
{
    private $redirect;
    private $subject;
    private $buttonLabel;
    private static $defaultLabel = 'Bookmark'; // @translate

    public function __construct(
        string $label = null,
        $name = null,
        array $options = []
    ) {
        parent::__construct($name, $options);
        $this->buttonLabel = $label ? $label : static::$defaultLabel;
    }

    public function setRedirect(string $redirect)
    {
        $this->redirect = $redirect;

        return $this;
    }

    public function setSubject(string $subject)
    {
        $this->subject = $subject;

        return $this;
    }

    public function init()
    {
        $this->add(new Hidden('redirect_to'));
        $this->add(new Hidden('subject'));

        $this->add(
            (new Submit('bookmark'))->setValue($this->buttonLabel)
        );
    }
}

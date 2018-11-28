<?php

namespace ElucidateModule\Admin;

use Zend\Form\Element\Textarea;
use Zend\Form\Form;

class ImportAnnotationForm extends Form
{
    public function init()
    {
        $this->add(
            (new Textarea('annotation_body', [
                'label' => 'Annotation body',
                'info' => 'Paste in an annotation body that you want to import',
            ]))->setAttribute('rows', 20)
        );
    }
}

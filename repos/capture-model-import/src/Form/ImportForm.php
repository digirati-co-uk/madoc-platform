<?php

namespace CaptureModelImport\Form;

use Zend\Form\Element;
use Zend\Form\Form;

class ImportForm extends Form
{
    private $sites;

    public function setSiteList(array $sites)
    {
        $this->sites = array_merge([
            0 => 'Choose site...' // @translate
        ], $sites);
    }

    public function init()
    {
        $this->add(
            (new Element\File('resource_file'))
                ->setOptions([
                    'label' => 'File', // @translate
                    'info' => 'A file containing Capture Model definitions', //@translate
                ])
        );

        if ($this->sites) {
            $this->add(
                (new Element\Select('resource_site'))->setValueOptions($this->sites)->setOptions([
                    'label' => 'Add to site', // @translate
                    'info' => 'Add directly to site after importing', // @translate
                ])
            );
        }

        $inputFilter = $this->getInputFilter();
        $inputFilter->add([
            'name' => 'resource_file',
            'required' => true,
        ]);
    }
}

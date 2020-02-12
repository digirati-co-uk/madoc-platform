<?php

namespace IIIFStorage\Admin;

use Digirati\OmekaShared\Framework\AbstractConfigurationForm;
use Zend\Form\Element;

class ConfigurationForm extends AbstractConfigurationForm {

    static protected function getSettingsNamespace(): string
    {
        return 'iiif-storage';
    }

    protected function getFormFields(): array
    {
        return [
            'thumbnail-size' => (new Element\Number())
                ->setOptions([
                    'label' => 'Default thumbnail size', // @translate
                    'info' => 'When import IIIF resources, what should the image size be for generating thumbnails', // @translate
                ])
                ->setAttribute('required', true),
        ];
    }
}

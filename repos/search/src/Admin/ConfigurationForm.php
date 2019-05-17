<?php

namespace MadocSearch\Admin;

use Digirati\OmekaShared\Framework\AbstractConfigurationForm;
use Zend\Form\Element;

class ConfigurationForm extends AbstractConfigurationForm {

    static protected function getSettingsNamespace(): string
    {
        return 'omeka-search';
    }

    protected function getFormFields(): array
    {
        return [
            'enable-item-search' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Enable item search', // @translate
                    'info' => 'When enabled, the search will return Omeka items', // @translate
                ])
                ->setAttribute('required', true),
        ];
    }
}

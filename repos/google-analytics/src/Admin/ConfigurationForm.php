<?php

namespace GoogleAnalytics\Admin;

use Digirati\OmekaShared\Framework\AbstractConfigurationForm;
use Zend\Form\Element;

class ConfigurationForm extends AbstractConfigurationForm
{
    static protected function getSettingsNamespace(): string
    {
        return 'google_analytics';
    }

    /** @return Element[] */
    protected function getFormFields(): array
    {
        return [
            'key' => (new Element\Text())
                ->setOptions([
                    'label' => 'Google Analytics tracking code', // @translate
                    'info' => 'The tracking code to be used in Google Analytics tracking snippets', // @translate
                ])
        ];
    }
}

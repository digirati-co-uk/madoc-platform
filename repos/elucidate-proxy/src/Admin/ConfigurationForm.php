<?php

namespace ElucidateProxy\Admin;

use Digirati\OmekaShared\Framework\AbstractConfigurationForm;
use Zend\Form\Element;

class ConfigurationForm extends AbstractConfigurationForm
{
    static protected function getSettingsNamespace(): string
    {
        return 'elucidate_proxy';
    }

    /** @return Element[] */
    protected function getFormFields(): array
    {
        return [
            'url' => (new Element\Text())
                ->setOptions([
                    'label' => 'Elucidate endpoint url',
                    'info' => 'This has to be a W3C annotation server capable of allowing addition of annotations.',
                ])
        ];
    }
}

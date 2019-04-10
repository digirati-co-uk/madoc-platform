<?php

namespace i18n\Form;

use Digirati\OmekaShared\Framework\AbstractConfigurationForm;
use Zend\Form\Element;
use Zend\Form\Element\Checkbox;
use Zend\Form\Form;

class LocalizationConfigForm extends AbstractConfigurationForm
{
    static protected function getSettingsNamespace(): string
    {
        return 'i18n';
    }

    /** @return Element[] */
    protected function getFormFields(): array
    {
        return [
            'enabled' => (new Checkbox(
                'enabled', [
                    'label' => 'Enable Omeka localization',
                    'info' => 'When enabled, locally found translations will be applied',
                ]
            )),
            'transifex-enabled' => (new Checkbox('transifex-enabled', [
                'label' => 'Enable Transifex localization',
                'info' => 'A feature flag to enable/disable integration with ' .
                    'Transifex.  When enabled, any translatable content will' .
                    'be mirrorred to a Transifex project for the site it belongs to.',
            ]))
        ];
    }
}

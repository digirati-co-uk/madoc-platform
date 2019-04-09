<?php

namespace i18n\Form;

use Zend\Form\Element\Checkbox;
use Zend\Form\Form;

class LocalizationConfigForm extends Form
{
    public function init()
    {
        $enabled = new Checkbox(
            'enable', [
                        'label' => 'Enable Transifex localization',
                        'info' => 'A feature flag to enable/disable integration with '.
                            'Transifex.  When enabled, any translatable content will'.
                            'be mirrorred to a Transifex project for the site it belongs to.',
                    ]
        );
        $enabled->setCheckedValue($this->getOption('enabled'));
        $enabled->setLabel('Enable');
        $enabled->setCheckedValue(1);
        $enabled->setUncheckedValue(0);

        $this->add($enabled);
    }
}

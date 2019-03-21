<?php

namespace AnnotationStudio\Admin;

use Digirati\OmekaShared\Framework\AbstractConfigurationForm;
use Zend\Form\Element;

class ConfigurationForm extends AbstractConfigurationForm
{

    static protected function getSettingsNamespace(): string
    {
        return 'annotation_studio';
    }

    /** @return Element[] */
    protected function getFormFields(): array
    {
        return [
            'use_open_seadragon' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Use Open Seadragon as the viewer', // @translate
                    'info' => 'If this is not checked, the viewer will fallback to a static image viewer, this does not affect annotations.', // @translate
                ])
                ->setAttribute('required', false),

            'default_resource_template' => (new Element\Text())
                ->setOptions([
                    'label' => 'Default Resource Template endpoint', // @translate
                    'info' => 'During development phase, this will be a single endpoint', // @translate
                ])
                ->setAttribute('required', false),

            'google_map_api' => (new Element\Text())
                ->setOptions([
                    'label' => 'Google map API key',
                    'info' => 'Generate a google map API, required if you use capture models with locations'
                ])
                ->setAttribute('required', false),

            'default_moderation_status' => (new Element\Text())
                ->setOptions([
                    'label' => 'Default moderation status', // @translate
                    'info' => 'Moderation status that will be applied to annotations created', // @translate
                ])
                ->setAttribute('required', false),
        ];
    }
}

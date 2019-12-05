<?php

namespace AnnotationStudio\Admin;

use Digirati\OmekaShared\Framework\AbstractConfigurationForm;
use GuzzleHttp\Client;
use Zend\Form\Element;
use Zend\Form\Element\Select;

class ConfigurationForm extends AbstractConfigurationForm
{

    static protected function getSettingsNamespace(): string
    {
        return 'annotation_studio';
    }

    /** @return Element[] */
    protected function getFormFields(): array
    {
        $versions = ['latest'];
        try {
            $client = new Client();
            $resp = $client->get('https://registry.npmjs.org/@annotation-studio/bundle');
            $bundle = json_decode($resp->getBody(), true);
            $bundleVersions = array_reverse($bundle['versions']);
            foreach ($bundleVersions as $version => $b) {
                $versions[$version] = $version;
            }
        } catch (\Throwable $e) {
            error_log($e);
        }

        return [
            'version' => (new Select('version', [
                'label' => 'Annotation studio version', // @translate
                'info' => 'The version of the Javascript to use. NOTE: Older versions may not work with this module.', // @translate
                'options' => $versions,
            ])),

            'debug' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Debug mode', // @translate
                    'info' => 'This should never be run in production and is for testing only.', // @translate
                ])
                ->setAttribute('required', false),

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
                    'label' => 'Google map API key', // @translate
                    'info' => 'Generate a google map API, required if you use capture models with locations' // @translate
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

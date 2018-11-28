<?php

namespace ElucidateModule\Admin;

use Digirati\OmekaShared\Framework\AbstractConfigurationForm;
use Zend\Form\Element;

class ConfigurationForm extends AbstractConfigurationForm
{
    static protected function getSettingsNamespace(): string
    {
        return 'elucidate';
    }

    /** @return Element[] */
    protected function getFormFields(): array
    {
        // TODO: Implement getFormFields() method.
        return [
            'site_domain' => (new Element\Url())
                ->setOptions([
                    'label' => 'Primary site domain', // @translate
                    'info' => 'This should be used as the domain for generating `generator` URIs', // @translate
                ])
                ->setAttribute('required', true),

            'item_endpoint' => (new Element\Text())
                ->setOptions([
                    'label' => 'Endpoint for elucidate pages (BROKEN, default is /topics)', // @translate
                    'info' => 'This is the endpoint that can be used to serve item pages', // @translate
                ])
                ->setAttribute('required', true)
                ->setValue('elucidate'),

            'search_field_name' => (new Element\Text())
                ->setOptions([
                    'label' => 'Field to search from URI', // @translate
                    'info' => 'This will be used to query for items using the URI, defaults to ID', // @translate
                ])
                ->setAttribute('required', false)
                ->setValue('id'),

            'search_using_uri' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Elucidate - Searching using ID from URI or the whole URI', // @translate
                    'info' => 'If this is is checked the whole URI of the current page will be queried in the database, if not only the slugified ID will be queried.', // @translate
                ])
                ->setAttribute('required', false),

            'search_by_id' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Elucidate - search by ID (defaults is source)', // @translate
                    'info' => 'Check this if target of the search should be the ID', // @translate
                ])
                ->setAttribute('required', false),

            'search_field_is_property' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Is the search field a property ID and not an ID', // @translate
                    'info' => 'Check this if the field is a property ID, a fallback to normal searching.', // @translate
                ])
                ->setAttribute('required', false),

            'server_url' => (new Element\Text())
                ->setOptions([
                    'label' => 'Elucidate server (with trailing slash)', // @translate
                    'info' => 'This has to be a W3C annotation server capable of searching for driving the results.', // @translate
                ])
                ->setAttribute('required', true),

            'search_search_using_class' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Search using Class', // @translate
                    'info' => 'Should the Elucidate search use the class from the URI to perform its search', // @translate
                ])
                ->setAttribute('required', false),

            'search_has_virtual' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Enable virtual item detection', // @translate
                    'info' => 'Should we avoid searching if the virtual class prefix is set', // @translate
                ])
                ->setAttribute('required', false),

            'search_virtual_prefix' => (new Element\Text())
                ->setOptions([
                    'label' => 'Virtual prefix', // @translate
                    'info' => 'The prefix to look for when detecting virtual topics', // @translate
                ])
                ->setAttribute('required', false),

            'search_search_uri' => (new Element\Text())
                ->setOptions([
                    'label' => 'Elucidate search host override', // @translate
                    'info' => 'When searching elucidate, this will replace the search body url, good for local development to change the localhost to a real domain', // @translate
                ])
                ->setAttribute('required', false),

            'search_search_https' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Force https on search URIs', // @translate
                    'info' => 'Forces HTTPS to be used when searching', // @translate
                ])
                ->setAttribute('required', false)
                ->setValue(true),

            'import_omeka_items' => (new Element\Checkbox())
                ->setOptions([
                    'label' => 'Import Omeka items', // @translate
                    'info' => 'Import Omeka items that are posted in elucidate', // @translate
                ])
                ->setAttribute('required', false),

            'generator_value' => (new Element\Text())
                ->setOptions([
                    'label' => 'Value for generator element', // @translate
                    'info' => 'Value for generator element in created Annotations', // @translate
                ])
                ->setAttribute('required', false),

            'transcriptions_endpoint' => (new Element\Text())
                ->setOptions([
                    'label' => 'Transcription endpoint', // @translate
                    'info' => 'Starsky endpoint for plaintext transcriptions', // @translate
                ])
                ->setAttribute('required', false),

            'tacsi_uri' => (new Element\Text())
                ->setOptions([
                    'label' => 'Tacsi endpoint', // @translate
                    'info' => 'Tacsi endpoint for getting tag information', // @translate
                ])
                ->setAttribute('required', false),

            'topic_collection_uri' => (new Element\Text())
                ->setOptions([
                    'label' => 'Topic Collection endpoint', // @translate
                    'info' => 'Topic collection generating IIIF collections', // @translate
                ])
                ->setAttribute('required', false),
        ];
    }
}

<?php

namespace Digirati\OmekaShared\Framework;

use Omeka\Settings\Settings;
use Zend\Form\Element;
use Zend\Form\Form;
use Zend\Mvc\Controller\AbstractController;

abstract class AbstractConfigurationForm extends Form implements HydratableConfigurationForm
{
    abstract static protected function getSettingsNamespace(): string;

    /** @return Element[] */
    abstract protected function getFormFields(): array;

    public static function fromPost(array $postData, $form = null): HydratableConfigurationForm
    {
        if ($form === null) {
            $form = new static();
            $form->init();
        }

        $form = new static();
        $form->init();
        $form->setData($postData);

        return $form;
    }

    public static function fromSettings(Settings $settings, $form = null): HydratableConfigurationForm
    {
        if ($form === null) {
            $form = new static();
            $form->init();
        }

        $fields = $form->getFormFields();
        $namespace = $form->getSettingsNamespace();
        $fieldKeys = array_keys($fields);

        // Uses the form to find saved settings using the namespace provided.
        $form->setData(
            array_reduce($fieldKeys, function ($acc, $fieldKey) use ($namespace, $settings, $fields) {
                $field = $fields[$fieldKey];
                $settingsId = $namespace . '_' . $fieldKey;

                $acc[$fieldKey] = $settings->get(
                    $settingsId,
                    $field->getValue()
                );
                return $acc;
            }, []
            )
        );

        return $form;
    }

    public function saveToSettings(Settings $settings)
    {
        $formData = $this->getData();

        $fields = static::getFormFields();
        $namespace = $this->getSettingsNamespace();
        $fieldKeys = array_keys($fields);

        foreach ($fieldKeys as $fieldKey) {
            $settings->set($namespace . '_' . $fieldKey, $formData[$fieldKey]);
        }

        return true;
    }

    public function init() {
        $fields = $this->getFormFields();
        $this->prepareFields($fields);
        foreach ($fields as $fieldKey => $field) {
            $field->setName($fieldKey);
            $this->add($field);
        }
        $this->postProcessFields($fields);
    }

    protected function prepareFields(&$fields)
    {
    }

    protected function postProcessFields($fields)
    {
    }

}

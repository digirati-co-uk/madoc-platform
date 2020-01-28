<?php

namespace Digirati\OmekaShared\Framework;

use Locale;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Request;
use Omeka\Entity\Media;
use Omeka\Media\Ingester\MutableIngesterInterface;
use Omeka\Stdlib\ErrorStore;
use PublicUser\Settings\PublicUserSettings;
use ResourceBundle;
use Zend\Form\Element;
use Zend\ModuleManager\ModuleManager;
use Zend\View\Renderer\PhpRenderer;

abstract class AbstractIngester implements MutableIngesterInterface
{
    const SITE_ROLE_ID = 'site-role';
    static $LOCALES = null;

    /**
     * @param Media $media
     * @param array $formValues
     * @param bool $isInitial
     * @param ErrorStore $errorStore
     */
    public function saveFormValues(Media $media, array $formValues, bool $isInitial, ErrorStore $errorStore)
    {
        $this->prepareData($formValues, $errorStore);

        $media->setData($formValues);
    }

    public function prepareData(array &$data, ErrorStore $errorStore)
    {
    }

    public function parseFormData($data) {
        return $data;
    }

    /**
     * @return Element|\Zend\Form\ElementInterface
     */
    public function getSiteRolesField()
    {
        try {
            if (class_exists(PublicUserSettings::class)) {
                return (new Element\MultiCheckbox(self::SITE_ROLE_ID))
                    ->setValueOptions(PublicUserSettings::ADDITIONAL_ROLES)
                    ->setValue(array_keys(PublicUserSettings::ADDITIONAL_ROLES))
                    ->setOptions([
                        'label' => 'Visible only to roles',
                        'info' => 'Only users with the roles that are checked will be able to see this block.'
                    ])
                    ->setAttributes([
                        'id' => 'locale',
                        'class' => 'chosen-select',
                    ]);
            }
        } catch (\Throwable $e) {
            error_log($e->getMessage());
        }

        // Default to hidden element with viewer (all users).
        return (new Element\Hidden('site-role'))->setValue('viewer');
    }

    /**
     * @return Element|\Zend\Form\ElementInterface
     */
    public function getLocaleField()
    {
        if (!self::$LOCALES) {
            $allLocals = ResourceBundle::getLocales('');
            self::$LOCALES = array_reduce($allLocals, function ($acc, $code) {
                $acc[$code] = Locale::getDisplayName($code, $code) . ' (' . $code . ')';
                return $acc;
            }, ['default' => 'Default']);
        }

        return (new Element\Select('locale'))
            ->setValueOptions(self::$LOCALES)
            ->setOptions([
                'label' => 'Locale',
                'info' => 'If you want this block to be associated with a particular ' .
                    'locale you can select one here. By default this will show the ' .
                    'block to users with the selected locale. Remember to add different ' .
                    'locales you may have on the site, or the block may not be visible to users. ' .
                    'If "Default" is selected, this block will show on all pages.'
            ])
            ->setAttributes([
                'id' => 'locale',
                'class' => 'chosen-select',
            ]);
    }

    /**
     * @param string $operation either "create" or "update"
     * @return Element[]
     */
    abstract public function getFormElements(string $operation): array;

    /**
     * Process an ingest (create) request.
     *
     * @param Media $media
     * @param Request $request
     * @param ErrorStore $errorStore
     */
    public function ingest(Media $media, Request $request, ErrorStore $errorStore)
    {
        $content = $request->getContent();
        $this->saveFormValues($media, $content, true, $errorStore);
    }

    /**
     * @param Element[] $formElements
     * @param string $fieldset
     * @return Element[]
     */
    public function parseFormElements(array $formElements, $fieldset = 'o:media[__index__]')
    {
        foreach ($formElements as $formElement) {
            $name = $formElement->getName();
            if (strpos($name, $fieldset) !== 0) {
                $formElement->setName($fieldset . '[' . $name . ']');
            }
        }
        return $formElements;
    }

    /**
     * @param PhpRenderer $view
     * @param Element[] $formElements
     * @return string
     */
    public function renderFormElements(PhpRenderer $view, array $formElements)
    {
        return implode('',
            array_map(function ($el) use ($view) {
                return $view->formRow($el);
            }, $formElements)
        );
    }

    /**
     * Render a form for adding media.
     *
     * @param PhpRenderer $view
     * @param array $options
     * @return string
     */
    public function form(PhpRenderer $view, array $options = [])
    {
        $elements = $this->getFormElements('create');

        return $this->renderFormElements(
            $view,
            $this->parseFormElements($elements)
        );
    }

    /**
     * @param Element[] $formElements
     * @param array $data
     * @return Element[]
     */
    public function setFormValues(array $formElements, array $data)
    {
        foreach ($formElements as $formElement) {
            if ($data[$formElement->getName()]) {
                $formElement->setValue($data[$formElement->getName()]);
            }
        }
        return $formElements;
    }

    /**
     * Process an update request.
     *
     * @param Media $media
     * @param Request $request
     * @param ErrorStore $errorStore
     */
    public function update(Media $media, Request $request, ErrorStore $errorStore)
    {
        $content = $request->getContent();
        if (!isset($content['o:media']['__index__'])) {
            $errorStore->addError('error', 'No content to save');
            return;
        }
        $this->saveFormValues($media, $content['o:media']['__index__'], false, $errorStore);
    }

    /**
     * Render a form for updating media.
     *
     * @param PhpRenderer $view
     * @param MediaRepresentation $media
     * @param array $options
     * @return string
     */
    public function updateForm(PhpRenderer $view, MediaRepresentation $media, array $options = [])
    {
        $formElements = $this->getFormElements('update');

        return $this->renderFormElements(
            $view,
            $this->parseFormElements(
                $this->setFormValues($formElements, $this->parseFormData($media->mediaData()))
            )
        );
    }
}


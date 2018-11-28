<?php


namespace IIIFStorage\Media;


use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Request;
use Omeka\Entity\Media;
use Omeka\Media\Ingester\MutableIngesterInterface;
use Omeka\Site\BlockLayout\BlockLayoutInterface;
use Omeka\Stdlib\ErrorStore;
use Zend\Form\Element;
use Zend\View\Renderer\PhpRenderer;

abstract class AbstractIngester implements MutableIngesterInterface
{
    /**
     * @param Media $media
     * @param array $formValues
     * @param bool $isInitial
     * @param ErrorStore $errorStore
     */
    public function saveFormValues(Media $media, array $formValues, bool $isInitial, ErrorStore $errorStore) {
        $media->setData($formValues);
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
                $formElement->setName($fieldset. '[' . $name. ']');
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
                $this->setFormValues($formElements, $media->mediaData())
            )
        );
    }
}
<?php

namespace IIIFStorage\Media;

use Digirati\OmekaShared\Framework\AbstractIngester;
use Omeka\Entity\Media;
use Omeka\Media\Ingester\IngesterInterface;
use Omeka\Stdlib\ErrorStore;
use Zend\Form\Element;

class GenericServiceIngester extends AbstractIngester implements IngesterInterface
{

    /**
     * @inheritDoc
     */
    public function getFormElements(string $operation): array
    {
        return [
            (new Element\Textarea('raw-json'))
                ->setOptions([
                    'label' => 'Service JSON', // @translate
                    'info' => 'Paste in the service JSON', // @translate
                ])
                ->setAttributes([
                    'rows' => 15,
                ]),
        ];
    }

    public function saveFormValues(Media $media, array $formValues, bool $isInitial, ErrorStore $errorStore)
    {
        $media->setData(json_decode($formValues['raw-json'], true));
    }

    public function parseFormData($data)
    {
        return [
            'raw-json' => json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        ];
    }

    /**
     * @inheritDoc
     */
    public function getLabel()
    {
        return 'Generic service';
    }

    /**
     * @inheritDoc
     */
    public function getRenderer()
    {
        return 'generic-service';
    }
}

<?php

namespace IIIFStorage\Aggregate;

use IIIFStorage\Model\ItemRequest;
use IIIFStorage\Model\MediaValue;
use Zend\Log\Logger;

class AddImageService implements AggregateInterface
{
    /**
     * @var Logger
     */
    private $logger;

    public function __construct(Logger $logger)
    {
        $this->logger = $logger;
    }

    private $imageServices = [];

    public function mutate(ItemRequest $input)
    {
        $sources = $input->getValue('dcterms:source');
        foreach ($sources as $source) {
            $id = md5($source->getValue());
            $imageService = $this->imageServices[$id];
            $this->logger->debug("Adding image service as media to Canvas {$imageService}");
            if ($imageService) {
                $input->addField(
                    MediaValue::IIIFImage($imageService, 'Image service')
                );
            }
        }
    }

    public function supports(ItemRequest $input)
    {
        return (
            $input->getResourceTemplateName() === 'IIIF Canvas' &&
            $input->hasField('dcterms:source')
        );
    }

    public function parse(ItemRequest $input)
    {
        $sources = $input->getValue('dcterms:source');
        foreach ($sources as $source) {
            $id = md5($source->getValue());
            $canvasJson = json_decode($source->getValue(), true);
            $images = $canvasJson['images'] ?? [];
            $this->logger->debug("Found images on Canvas {$id}");
            foreach ($images as $image) {
                $service = $image['resource']['service']['@id'] ?? null;
                $this->logger->debug("Found image service {$service}");
                if ($id && $service) {
                    $this->imageServices[$id] = "$service/info.json";
                }
            }
        }
    }

    public function prepare()
    {

    }
}

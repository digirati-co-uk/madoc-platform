<?php

namespace IIIFStorage\Aggregate;

use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\Model\MediaValue;
use Zend\Log\Logger;

class AddImageService implements AggregateInterface
{
    /**
     * @var Logger
     */
    private $logger;

    private $thumbnailServices = [];

    private $imageServices = [];

    public function __construct(Logger $logger)
    {
        $this->logger = $logger;
    }

    public function mutate(ItemRequest $input)
    {
        $sources = $input->getValue('dcterms:source');
        foreach ($sources as $source) {
            $id = md5($source->getValue());
            $imageService = $this->imageServices[$id];
            $thumbnailService = $this->thumbnailServices[$id];
            $this->logger->debug("Adding image service as media to Canvas {$imageService}");
            if ($thumbnailService) {
                $this->logger->debug("Found thumbnail service on Canvas {$thumbnailService}");
            }
            if ($imageService) {
                $input->addField(
                    $thumbnailService ?
                        MediaValue::IIIFImageThumbnail($imageService, 'Image service', $thumbnailService) :
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
                $thumbnailService = $canvasJson['thumbnail']['service']['@id'] ?? null;
                $this->logger->debug("Found image service {$service}");
                if ($id && $service) {
                    if (substr($service, -10) !== '/info.json') {
                        $service = "$service/info.json";
                    }
                    $this->imageServices[$id] = $service;
                    if ($thumbnailService) {
                        if (substr($thumbnailService, -10) !== '/info.json') {
                            $thumbnailService = "$thumbnailService/info.json";
                        }
                        $this->thumbnailServices[$id] = $thumbnailService;
                    }
                }
            }
        }
    }

    public function prepare()
    {

    }
}

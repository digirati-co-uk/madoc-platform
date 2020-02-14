<?php

namespace IIIFStorage\Aggregate;

use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Model\MediaValue;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Zend\Log\Logger;

class AddImageService implements AggregateInterface
{
    /**
     * @var Logger
     */
    private $logger;

    private $thumbnailServices = [];

    private $imageServices = [];

    private $thumbnailUrls = [];
    /**
     * @var PropertyIdSaturator
     */
    private $saturator;

    public function __construct(
        Logger $logger,
        PropertyIdSaturator $saturator
    ) {
        $this->logger = $logger;
        $this->saturator = $saturator;
    }

    public function mutate(ItemRequest $input)
    {
        $sources = $input->getValue('dcterms:source');
        foreach ($sources as $source) {
            $id = md5($source->getValue());
            $imageService = $this->imageServices[$id];
            $thumbnailService = $this->thumbnailServices[$id];
            $thumbnailUrl = $this->thumbnailUrls[$id];
            $this->logger->debug("Adding image service as media to Canvas {$imageService}");
            if ($thumbnailService) {
                $this->logger->debug("Found thumbnail service on Canvas {$thumbnailService}");
            }
            if ($thumbnailUrl) {
                $this->logger->debug("Found thumbnail URL on Canvas {$thumbnailUrl}");
            }

            if (!$imageService) {
                continue;
            }

            // Direct URL available for thumbnail.
            if ($thumbnailUrl) {
                $input->addField(
                    MediaValue::IIIFImage($imageService, 'Image service', $thumbnailUrl)
                );
                continue;
            }

            // Thumbnail service (ext)
            if ($thumbnailService) {
                $input->addField(
                    MediaValue::IIIFImageThumbnail($imageService, 'Image service', $thumbnailService)
                );
                continue;
            }

            // No thumbnail service available.
            $input->addField(
                    MediaValue::IIIFImage($imageService, 'Image service')
            );
        }
    }

    public function supports(ItemRequest $input)
    {
        $canvas = $this->saturator->getResourceClassByTerm('sc:Canvas');

        return (
            (string)$input->getResourceClass() === (string)$canvas->id() &&
            $input->hasField('dcterms:source')
        );
    }

    public function parse(ItemRequest $input, array $metadata = [])
    {
        $sources = $input->getValue('dcterms:source');
        foreach ($sources as $source) {
            $id = md5($source->getValue());
            $canvasJson = json_decode($source->getValue(), true);
            $images = $canvasJson['images'] ?? [];
            $this->logger->debug("Found images on Canvas {$id}");
            foreach ($images as $image) {
                $service = $image['resource']['service']['@id'] ?? null;
                $thumbnailResource = $canvasJson['thumbnail'] ?? null;
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
                    if ($thumbnailResource) {
                        $width = $thumbnailResource['width'] ?? null;
                        if ($width <= 1000) {
                            $this->thumbnailUrls[$id] = $thumbnailResource['@id'] ?? $thumbnailResource['id'] ?? null;
                        }
                    }
                }
            }
        }
    }

    public function reset()
    {
        $this->imageServices = [];
        $this->thumbnailServices = [];
    }

    public function prepare()
    {

    }
}

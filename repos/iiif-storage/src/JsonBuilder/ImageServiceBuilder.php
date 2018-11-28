<?php

namespace IIIFStorage\JsonBuilder;


use IIIFStorage\Utility\ApiRouter;
use Omeka\Api\Representation\MediaRepresentation;

class ImageServiceBuilder
{

    /**
     * @var ApiRouter
     */
    private $router;

    /**
     * @var string
     */
    private $siteId;

    public function __construct(ApiRouter $router)
    {
        $this->router = $router;
    }

    public function build(MediaRepresentation $image): array
    {
        $json = [];
        $service = $this->extractSource($image);

        // 1. Set new ID.
        $json['@id'] = $image->thumbnailUrl('large');
        $json['@type'] = 'dctypes:Image';
        $json['format'] = 'image/jpg'; // @todo detect.
        $json['height'] = $service['height'];
        $json['width'] = $service['width'];
        $json['service'] = $service;

        return $json;
    }


    public function setSiteId(string $siteId)
    {
        $this->siteId = $siteId;
    }

    private function extractSource(MediaRepresentation $image): array
    {
        return $image->mediaData();
    }
}

<?php

namespace IIIFStorage\Utility;


use Digirati\OmekaShared\Helper\UrlHelper;

class ApiRouter
{
    /**
     * @var UrlHelper
     */
    private $url;

    public function __construct(UrlHelper $url)
    {
        $this->url = $url;
    }

    public function collection(string $id, bool $site = false)
    {
        return $this->url->create($this->getRoute('collection', $site), [
            'collection' => $id,
        ], ['force_canonical' => true], true);
    }

    public function manifest(string $id, bool $site = false)
    {
        return $this->url->create($this->getRoute('manifest', $site), [
            'manifest' => $id,
        ], ['force_canonical' => true], true);
    }

    public function siteCollection()
    {
        return $this->url->create($this->getRoute('site-collection', true), [], ['force_canonical' => true], true);
    }

    public function canvas(string $canvasId, bool $site = false)
    {
        return $this->url->create($this->getRoute('canvas', $site), [
            'canvas' => $canvasId,
        ], ['force_canonical' => true], true);
    }

    public function manifestsCanvas(string $manifestId, string $canvasId, bool $site = false)
    {
        return $this->url->create($this->getRoute('manifestsCanvas', $site), [
            'manifest' => $manifestId,
            'canvas' => $canvasId,
        ], ['force_canonical' => true], true);
    }

    public function imageService(string $id, bool $site = false)
    {
        return $this->url->create($this->getRoute('image-service', $site), [
            'image-service' => $id,
        ], ['force_canonical' => true], true);
    }

    public function getRoute(string $name, bool $site)
    {
        if ($site) {
            return "site/iiif-storage/$name";
        }
        return "iiif-storage/$name";
    }
}

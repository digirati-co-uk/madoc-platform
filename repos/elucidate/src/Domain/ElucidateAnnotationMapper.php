<?php

namespace ElucidateModule\Domain;

use Doctrine\Common\Cache\Cache;
use Digirati\OmekaShared\Helper\UrlHelper;
use ElucidateModule\ViewModel\Annotation;
use ElucidateModule\ViewModel\OmekaLink;
use ElucidateModule\ViewModel\OmekaSource;
use ElucidateModule\ViewModel\Thumbnail;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use IIIF\Model\Manifest;
use IIIF\Model\Region;
use IIIFImport\Extension\Representation\CanvasMappingRepresentation;
use Omeka\Api\Manager;
use Zend\Log\Logger;

class ElucidateAnnotationMapper
{
    private $api;
    private $manifestCache = [];
    private $httpClient;
    private $mappingCache;
    private $manifestJson = [];
    private $urlHelper;
    private $logger;

    public function __construct(Manager $api, ClientInterface $http, Cache $mappingCache, UrlHelper $urlHelper, Logger $logger)
    {
        $this->api = $api;
        $this->httpClient = $http;
        $this->mappingCache = $mappingCache;
        $this->urlHelper = $urlHelper;
        $this->logger = $logger;
    }

    public static function getTagLabelFromSource($source)
    {
        if (!$source) {
            return null;
        }
        $parts = explode('/', $source);

        if (0 === count($parts)) {
            return null;
        }

        return preg_replace('/[+|_]/', ' ', $parts[count($parts) - 1]);
    }

    private function loadManifest($url)
    {
        if ($url && is_array($url)) {
            if (isset($url['id'])) {
                try {
                    return $this->loadManifest($url['id']);
                } catch (RequestException $exception) {
                    error_log($exception->getMessage());

                    return null; // We assume it doesn't exist.
                }
            }

            return null;
        }

        if (isset($this->manifestCache[$url])) {
            return $this->manifestCache[$url];
        }

        try {
            $response = $this->httpClient->request('GET', $url);
        } catch (GuzzleException $e) {
            return null;
        }
        $responseBody = (string) $response->getBody();
        $this->manifestJson[$url] = json_decode($responseBody, true);

        return $this->manifestCache[$url] = Manifest::fromJson($responseBody);
    }

    public function generateManifestUrl(string $manifestOmekaId = null)
    {
        if (!$manifestOmekaId) {
            return null;
        }

        return $this->urlHelper->create('site/iiif-view-manifest-view', [
            'manifest' => $manifestOmekaId,
        ], ['force_canonical' => true], true);
    }

    public function generateCanvasUrl(string $manifestOmekaId = null, string $canvasOmekaId = null)
    {
        if (!$manifestOmekaId || !$canvasOmekaId) {
            return null;
        }

        return $this->urlHelper->create('site/iiif-view-canvas-view', [
            'canvas' => $canvasOmekaId,
            'manifest' => $manifestOmekaId,
        ], ['force_canonical' => true], true);
    }

    public function loadManifestJson($url)
    {
        if (!$this->manifestJson[$url]) {
            $this->loadManifest($url);
        }

        return $this->manifestJson[$url] ?? null;
    }

    public function mapAnnotations(array $annotationsJson)
    {
        return array_map(function ($item) {
            return $this->mapSingleAnnotation($item);
        }, $annotationsJson['first']['items'] ?? []);
    }

    public function mapSearch(array $mathmosJson)
    {
        return array_filter(array_map(function ($item) {
            return $this->mapSingleAnnotation($item);
        }, $mathmosJson['http://iiif.io/api/presentation/2#hasAnnotations']['@list']));
    }

    /** @return Annotation|null */
    public function mapSingleAnnotation($annotation)
    {
        $canvasId = $this->getCanvasFromAnnotation($annotation);
        $meta = $this->getMetaFromApi($canvasId);
        $hasBody = isset($annotation['body']);

        $canvasId = $canvasId ? $canvasId : ($meta['canvas'] ?? null);
        if (!$canvasId) {
            return null;
        }
        if (is_array($annotation['motivation'])) {
            $motivation = $annotation['motivation']['label'] ?? 'unknown';
        } else {
            $motivation = $annotation['motivation'] ?? 'unknown';
        }
        $manifestUrl = $meta['manifest'] ? $meta['manifest'] : $this->getManifestFromAnnotation($annotation);
        $manifest = $manifestUrl ? $this->loadManifest($manifestUrl) : null;
        $json = $manifestUrl ? $this->loadManifestJson($manifestUrl) : null;

        if (!$manifest) {
            return null;
        }

        if (!$hasBody) {
            $manifestOmekaUri = $this->generateManifestUrl($meta['manifestOmekaId']);
            $canvasOmekaUri = $this->generateCanvasUrl($meta['manifestOmekaId'], $meta['canvasOmekaId']);

            return new Annotation(
                $annotation['id'] ?? $annotation['@id'],
                (isset($annotation['label']) && $annotation['label']) ? $annotation['label'] : '',
                new OmekaLink($manifest ? $manifest->getLabel() : 'Image/Canvas', $canvasOmekaUri),
                new OmekaLink($manifest ? $manifest->getLabel() : 'Unit', $manifestOmekaUri),
                new OmekaSource($body->source ?? '', $body->type ?? ''),
                null,
                $motivation,
                (bool) $manifest,
                $annotation
            );
        }

        // Taken from IIIF View.
        $thumbnails = array_reduce($json['sequences'][0]['canvases'] ?? [], function ($acc, $n) {
            // Copy sizes
            if (
                !isset($n['thumbnail']) ||
                !isset($n['thumbnail']['service']) ||
                !isset($n['thumbnail']['service']['sizes'])
            ) {
                return $acc;
            }

            $sizes = array_merge([], $n['thumbnail']['service']['sizes']);
            // Sort by largest.
            usort($sizes, function ($a, $b) {
                return ($a['height'] * $a['width']) <=> ($b['height'] * $b['width']);
            });

            $service = $n['thumbnail']['service'];
            $baseUri = $service['@id'];

            $images = [];
            foreach ($sizes as $size) {
                $images[] = sprintf('%s/full/%d,%d/0/default.%s',
                    $baseUri,
                    $size['width'],
                    $size['height'],
                    $service['format'][0] ?? $service['format'] ?? 'jpg'
                );
            }
            $acc[$n['@id']] = $images;

            return $acc;
        });

        $body = $hasBody ? AnnotationBody::fromBody($annotation['body']) : null;
        $region = $this->getAnnotationTargetAsRegion($annotation);
        $canvas = ($manifest && $canvasId) ? $manifest->getCanvas($canvasId) : null;

        $canvasThumbnails = $thumbnails[$canvasId];
        $smallestThumbnail = $canvasThumbnails[0] ?? null;
        $largestThumbnail = $canvasThumbnails ? $canvasThumbnails[count($canvasThumbnails) - 1] ?? null : null;
        $mediumThumbnail = $canvasThumbnails[1] ?? $canvasThumbnails[0] ?? null;

        if (!isset($meta['manifestOmekaId']) || !$meta['manifestOmekaId']) {
            $this->logger->debug(
                'Could not find Omeka ID for Manifest: ' . $manifest->getId() . ' ' .
                'from annotation: ' . ($annotation['id'] ?? $annotation['@id'] ?? 'unknown'));
            return null;
        }
        if (!isset($meta['canvasOmekaId']) || !$meta['canvasOmekaId']) {
            $this->logger->debug(
                'Could not find Omeka ID for Canvas: ' . $canvasId . ' ' .
                'in Manifest: ' . $manifest->getId() . ' ' .
                'from annotation: ' . ($annotation['id'] ?? $annotation['@id'] ?? 'unknown')
            );
            return null;
        }
        $manifestOmekaUri = $this->generateManifestUrl($meta['manifestOmekaId']);
        $canvasOmekaUri = $this->generateCanvasUrl($meta['manifestOmekaId'], $meta['canvasOmekaId']);

        return new Annotation(
            $annotation['id'] ?? $annotation['@id'],
            ucwords(strtolower(static::getLabelFromAnnotation($annotation, $body))),
            new OmekaLink($manifest ? $manifest->getLabel() : 'Image/Canvas', $canvasOmekaUri),
            new OmekaLink($manifest ? $manifest->getLabel() : 'Unit', $manifestOmekaUri),
            new OmekaSource($body->source ?? '', $body->type ?? ''),
            new Thumbnail(
                $canvas && $region ? $canvas->getRegion($region) : null,
                $canvas ? $canvas->getThumbnail() : null,
                $canvas ? ($smallestThumbnail ? $smallestThumbnail : $canvas->getThumbnail()) : null,
                $canvas ? ($mediumThumbnail ? $mediumThumbnail : $canvas->getThumbnail()) : null,
                $canvas ? ($largestThumbnail ? $largestThumbnail : $canvas->getThumbnail()) : null
            ),
            $motivation,
            (bool) $manifest,
            $annotation
        );
    }

    public static function getLabelFromAnnotation($annotation, AnnotationBody $body): string
    {
        $fromSource = $body->source ? static::getTagLabelFromSource($body->source) : null;
        if ($fromSource) {
            return $fromSource ?? '';
        }
        if ($annotation['label'] ?? false) {
            return $annotation['label'];
        }

        return $body->textualBody ?? '';
    }

    public function getManifestFromAnnotation($annotation)
    {
        if (isset($annotation['target']['dcterms:isPartOf'])) {
            return $annotation['target']['dcterms:isPartOf'];
        }
        if (!is_array($annotation['target'])) {
            return null;
        }
        foreach ($annotation['target'] as $target) {
            if (isset($target['dcterms:isPartOf'])) {
                return $target['dcterms:isPartOf'];
            }
        }

        return null;
    }

    public function getAnnotationSelector($annotation)
    {
        if (is_string($annotation['target'])) {
            return $annotation['target'];
        }
        if (isset($annotation['target']['selector'])) {
            return $annotation['target']['selector'];
        }
        foreach ($annotation['target'] as $target) {
            if (isset($target['selector'])) {
                return $target['selector'];
            }
        }

        return null;
    }

    /**
     * @todo expand for more regions and selectors.
     */
    public function getAnnotationTargetAsRegion($annotation)
    {
        $selector = $this->getAnnotationSelector($annotation);

        if (is_string($selector)) {
            if (false === strpos($selector, '#')) {
                return null;
            }

            return Region::fromUrlTarget($selector);
        }
        if (isset($selector['type']) && 'FragmentSelector' === $selector['type']) {
            if (isset($selector['value']) && is_string($selector['value']) && 'http://www.w3.org/TR/media-frags/' === $selector['conformsTo']) {
                return Region::fromUrlTarget('/#'.$selector['value']);
            }

            return null;
        }

        return null;
    }

    public function getCanonicalCanvasUrl($uri)
    {
        if (false === strpos($uri, '#')) {
            return $uri;
        }
        $segments = explode('#', $uri);
        array_pop($segments);

        return implode('#', $segments);
    }

    public function getCanvasFromAnnotation($annotation)
    {
        if (is_string($annotation['target'])) {
            return $this->getCanonicalCanvasUrl($annotation['target']);
        }
        if (isset($annotation['target']['source'])) {
            return $this->getCanonicalCanvasUrl($annotation['target']['source']);
        }
        foreach ($annotation['target'] as $target) {
            if (isset($target['source'])) {
                return $this->getCanonicalCanvasUrl($target['source']);
            }
        }
        if (isset($annotation['target']['id'])) {
            return $this->getCanonicalCanvasUrl($annotation['target']['id']);
        }
        foreach ($annotation['id'] as $target) {
            if (isset($target['id'])) {
                return $this->getCanonicalCanvasUrl($target['id']);
            }
        }

        return null;
    }

    public function getMetaFromApi($canvasUrl)
    {
        if (!$canvasUrl) {
            return null;
        }

        if (!$this->mappingCache->contains($canvasUrl)) {
            $response = $this->api->search(
                'canvas_mappings',
                [
                    'canvas_url' => $canvasUrl,
                ]
            );

            foreach ($response->getContent() as $result) {
                /** @var $result CanvasMappingRepresentation */
                if ($result->item()) {
                    $this->mappingCache->save($canvasUrl,
                        [
                            'manifestOmekaId' => $result->item()->id(),
                            'manifest' => $result->manifestUrl(),
                            'canvasOmekaId' => $result->canvasId(),
                            'canvas' => $result->canvasUrl(),
                        ]
                    );
                }
            }
        }

        return $this->mappingCache->fetch($canvasUrl);
    }
}

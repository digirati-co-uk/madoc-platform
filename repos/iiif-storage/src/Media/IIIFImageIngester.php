<?php
namespace IIIFStorage\Media;

use Digirati\OmekaShared\Framework\AbstractIngester;
use Omeka\Entity\Media;
use Omeka\File\Downloader;
use Omeka\Media\Ingester\IngesterInterface;
use Omeka\Stdlib\ErrorStore;
use Zend\Form\Element;
use Zend\Form\Element\Url as UrlElement;
use Zend\Http\Client as HttpClient;
use Zend\Uri\Http as HttpUri;

class IIIFImageIngester extends AbstractIngester implements IngesterInterface
{
    /**
     * @var HttpClient
     */
    protected $httpClient;

    /**
     * @var Downloader
     */
    protected $downloader;

    /**
     * @var int
     */
    protected $defaultThumbnailSize;

    /**
     * @var bool
     */
    protected $useTileSize;

    public function __construct(
        HttpClient $httpClient,
        Downloader $downloader,
        int $defaultThumbnailSize = 256,
        bool $useTileSize = true
    ) {
        $this->httpClient = $httpClient;
        $this->downloader = $downloader;
        $this->defaultThumbnailSize = $defaultThumbnailSize;
        $this->useTileSize = $useTileSize;
    }

    public function getLabel()
    {
        return 'IIIF image'; // @translate
    }

    public function getRenderer()
    {
        return 'iiif';
    }

    /**
     * @param Media $media
     * @param array $data
     * @param bool $isInitial
     * @param ErrorStore $errorStore
     *
     * @return bool
     */
    public function saveFormValues(Media $media, array $data, bool $isInitial, ErrorStore $errorStore) {
        if (!isset($data['o:source'])) {
            $errorStore->addError('o:source', 'No IIIF image URL specified');
            return false;
        }
        $source = $data['o:source'];
        //Make a request and handle any errors that might occur.
        $uri = new HttpUri($source);
        if (!($uri->isValid() && $uri->isAbsolute())) {
            $errorStore->addError('o:source', "Invalid URL specified");
            return false;
        }
        $client = $this->httpClient;
        $client->reset();
        $client->setUri($uri);
        $response = $client->send();
        if (!$response->isOk()) {
            $errorStore->addError('o:source', sprintf(
                "Error reading %s: %s (%s)",
                $this->getLabel(),
                $response->getReasonPhrase(),
                $response->getStatusCode()
            ));
            return false;
        }
        $IIIFData = json_decode($response->getBody(), true);
        if (!$IIIFData) {
            $errorStore->addError('o:source', 'Error decoding IIIF JSON');
            return false;
        }

        $thumbnailService = $data['thumbnail-service'] ?? null;
        $thumbnailIIIData = $thumbnailService ? $this->getThumbnailService($thumbnailService, $IIIFData, $errorStore) : $IIIFData;
        // Error with thumbnail service.
        if ($thumbnailIIIData === false) {
            return false;
        }

        $thumbnailSize = $data['thumbnail-size'] ?? $this->defaultThumbnailSize;
        $thumbnailSize = $thumbnailSize ? $thumbnailSize : 256;
        $getImageApiVersion = $this->getImageApiVersion($thumbnailIIIData['@context']);
        $fileName = $getImageApiVersion == 2 ? 'default' : 'native';
        $format = 'jpg'; // @todo customise - this is required for level0 support.
        $sizes = $this->getSizesFromService($thumbnailIIIData, $thumbnailSize);
        $id = $this->getIdFromService($thumbnailIIIData, $errorStore);
        // Error getting ID.
        if ($id === false) {
            return false;
        }

        //Check if valid IIIF data
        if ($this->validate($IIIFData)) {
            $media->setData($IIIFData);
        } else {
            $errorStore->addError('o:source', 'URL does not link to IIIF JSON');
            return false;
        }

        $imageUrl = implode('/', [
            $id,
            'full',
            $sizes,
            '0',
            $fileName . '.' . $format,
        ]);

        $tempFile = $this->downloader->download($imageUrl);
        if ($tempFile) {
            if ($tempFile->storeThumbnails()) {
                $media->setStorageId($tempFile->getStorageId());
                $media->setHasThumbnails(true);
            }
            $tempFile->delete();
        }

        return true;
    }

    //This check comes from Open Seadragon's own validation check
    public function validate($IIIFData)
    {
        if (isset($IIIFData['protocol']) && $IIIFData['protocol'] == 'http://iiif.io/api/image') {
            // Version 2.0
            return true;
        } elseif (isset($IIIFData['@context']) && (
                // Version 1.1
                $IIIFData['@context'] == "http://library.stanford.edu/iiif/image-api/1.1/context.json" ||
                $IIIFData['@context'] == "http://iiif.io/api/image/1/context.json")) {
            // N.B. the iiif.io context is wrong, but where the representation lives so likely to be used
            return true;
        } elseif (isset($IIIFData['profile']) &&
            // Version 1.0
            $IIIFData['profile'][0]("http://library.stanford.edu/iiif/image-api/compliance.html") === 0) {
            return true;
        } elseif (isset($IIIFData['identifier']) && $IIIFData['width'] && $IIIFData['height']) {
            return true;
        } elseif (isset($IIIFData['documentElement']) &&
            "info" == $IIIFData['documentElement']['tagName'] &&
            "http://library.stanford.edu/iiif/image-api/ns/" ==
            $IIIFData['documentElement']['namespaceURI']) {
            return true;
        }
        return false;
    }

    /**
     * @param string $operation either "create" or "update"
     * @return Element[]
     */
    public function getFormElements(string $operation): array
    {
        $urlInput = new UrlElement('o:source');
        $urlInput->setOptions([
            'label' => 'IIIF image URL', // @translate
            'info' => 'URL for the image to embed.', // @translate
        ]);
        $urlInput->setAttributes([
            'required' => true,
        ]);

        ($maxThumbnailSize = new Element\Number('thumbnail-size'))
            ->setValue($this->defaultThumbnailSize)
            ->setOptions([
                'label' => 'Thumbnail size',
                'info' => 'Custom thumbnail size that will be used to generate thumbnails.'
            ]);

        ($customThumbnailService = new Element\Text('thumbnail-service'))
            ->setOptions([
                'label' => 'Custom thumbnail service for tile source',
                'info' => 'A second image service to be used only for thumbnails',
            ]);

        return [
            $urlInput,
            $maxThumbnailSize,
            $customThumbnailService
        ];
    }

    private function getImageApiVersion($context)
    {
        if (is_string($context)) {
            if ($context === 'http://iiif.io/api/image/2/context.json') {
                return 2;
            }
            if ($context === 'http://iiif.io/api/image/1/context.json') {
                return 1;
            }
            return null;
        }
        foreach ($context as $ctx) {
            $version = $this->getImageApiVersion($ctx);
            if ($version) {
                return $version;
            }
        }
        return null;
    }

    private function getThumbnailService($thumbnailService, $fallback, $errorStore)
    {
        /** @var ErrorStore $errorStore */
        try {
            $uri = new HttpUri($thumbnailService);
            if (!($uri->isValid() && $uri->isAbsolute())) {
                $errorStore->addError('thumbnail-service', "Invalid URL specified");
                return false;
            }
            $client = $this->httpClient;
            $client->reset();
            $client->setOptions([ 'timeout' => 120 ]);
            $client->setUri($uri);
            $response = $client->send();
            if (!$response->isOk()) {
                $errorStore->addError('thumbnail-service', sprintf(
                    "Error reading %s: %s (%s)",
                    $this->getLabel(),
                    $response->getReasonPhrase(),
                    $response->getStatusCode()
                ));
                return false;
            }

            return json_decode($response->getBody(), true);
        } catch (\Throwable $e) {
            $errorStore->addError('thumbnail-service', (string) $e);
            error_log((string) $e);
            return $fallback;
        }
    }

    private function getSizesFromService(array $thumbnailIIIData, int $thumbnailSize): string
    {
        $sizes = $thumbnailIIIData['sizes'] ?? null;
        $fallback = "$thumbnailSize,";
        // We have defined sizes
        if ($sizes) {
            if (!$thumbnailSize) {
                // Return largest size that is less than 1000
                $maxSize = ['width' => 0, 'height' => 0];

                foreach ($sizes as $size) {
                    if ($size['width'] > $maxSize['width'] && $sizes['width'] <= 1000) {
                        $maxSize = $size;
                    }
                }

                if ($maxSize['width'] === 0) {
                    // No found sizes. return full size;
                    if (!isset($thumbnailIIIData['height'])) {
                        // Very bad path, but generally safe tile size
                        return '256,';
                    }

                    return $thumbnailIIIData['width'] . ',' . ($thumbnailIIIData['height'] ?? '');
                }

                return $maxSize['width'] . ',' . $maxSize['height'];
            }
            // return closest to size
            $closestSize = ['width' => 0, 'height' => 0];
            $delta = 100000000;

            foreach ($sizes as $size) {
                $newDelta = abs($thumbnailSize - $size['width']);
                if ($newDelta < $delta) {
                    $delta = $newDelta;
                    $closestSize = $size;
                }
            }
            if ($closestSize['width'] === 0) {
                return $fallback;
            }
            return $closestSize['width'] . ',' . $closestSize['height'];
        }
        // return exact requested size
        return $fallback;
    }

    private function getIdFromService(array $thumbnailIIIData, $errorStore)
    {
        $id = $thumbnailIIIData['@id'] ?? '';
        if (!$id) {
            $errorStore->addError('thumbnail-service', "Invalid URL specified (thumbnail service)");
            return false;
        }

        // Strip info json
        if (substr($id, -10) === '/info.json') {
            return substr($id, 0, -10);
        }

        // Strip end slash.
        return rtrim($id, '/');
    }
}

<?php

namespace i18n\Resource\Exporter;

use BabDev\Transifex\Resources;
use BabDev\Transifex\Translations;
use GuzzleHttp\Exception\RequestException;
use i18n\Resource\TranslatableResource;
use i18n\Resource\TranslatableResourceException;
use i18n\Resource\Writer\TranslatableResourceWriter;
use Throwable;
use Zend\Log\LoggerInterface;

class TransifexResourceExporter implements TranslatableResourceExporter
{
    /* @todo - get this from TranslatableResourceWriter */
    const FILE_TYPE = 'KEYVALUEJSON';

    /**
     * @var Resources
     */
    private $resources;

    /**
     * @var Translations
     */
    private $translations;
    /**
     * @var LoggerInterface
     */
    private $logger;

    public function __construct(LoggerInterface $logger, Resources $resources, Translations $translations)
    {
        $this->resources = $resources;
        $this->translations = $translations;
        $this->logger = $logger;
    }

    public function export(string $language, TranslatableResource $resource, TranslatableResourceWriter $writer)
    {
        $identifier = $resource->getIdentifier();

        if (!$identifier->hasProject()) {
            throw new TranslatableResourceException(
                'Unable to export a resource without knowing the project it belongs to'
            );
        }

        $project = $identifier->getProject();
        $resourceIdentifier = $identifier->getResourcePart();
        $resourceName = $identifier->getHumanReadableResourcePart();
        $messages = iterator_to_array($resource->getMessages());

        if (empty($messages)) {
            return;
        }

        $content = $writer->write($messages);

        try {
            $response = $this->resources->getResource($project, $resourceIdentifier);
            if (200 !== $response->getStatusCode()) {
                throw new TranslatableResourceException('Unable to find resource');
            }

            $response = $this->resources->updateResourceContent($project, $resourceIdentifier, $content);
            if (200 !== $response->getStatusCode()) {
                throw new TranslatableResourceException('Unable to upload updated translations to Transifex');
            }
        } catch (RequestException $requestException) {
            try {
                $response = $this->resources->createResource(
                    $project,
                    $resourceName,
                    $resourceIdentifier,
                    self::FILE_TYPE,
                    [
                        'content' => $content,
                    ]
                );

                if (201 !== $response->getStatusCode()) {
                    throw new TranslatableResourceException('Unable to send new translations to Transifex');
                }
            } catch (Throwable $ex) {
                $this->logger->warn("Unable to export translations: {$ex->getMessage()}", $ex->getTrace());
            }
        }
    }
}

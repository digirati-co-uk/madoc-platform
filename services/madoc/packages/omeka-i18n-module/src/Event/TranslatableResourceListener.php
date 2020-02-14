<?php

namespace i18n\Event;

use i18n\Resource\Exporter\TranslatableResourceExporter;
use i18n\Resource\TranslatableItemResource;
use i18n\Resource\TranslatableItemSetResource;
use i18n\Resource\TranslatableNavigationResource;
use i18n\Resource\TranslatablePageResource;
use i18n\Resource\Writer\TranslatableResourceWriter;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\SitePageRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\Item;
use Omeka\Entity\ItemSet;
use Omeka\Entity\Site;
use Omeka\Entity\SitePage;
use Omeka\Settings\Settings;
use Omeka\Settings\SiteSettings;
use Throwable;
use Zend\EventManager\Event;
use Zend\Log\LoggerInterface;

class TranslatableResourceListener
{
    /**
     * @var TranslatableResourceExporter
     */
    private $exporter;
    /**
     * @var TranslatableResourceWriter
     */
    private $writer;
    /**
     * @var Settings
     */
    private $settings;
    /**
     * @var SiteSettings
     */
    private $siteSettings;
    /**
     * @var LoggerInterface
     */
    private $logger;

    public function __construct(
        LoggerInterface $logger,
        Settings $settings,
        SiteSettings $siteSettings,
        TranslatableResourceExporter $exporter,
        TranslatableResourceWriter $writer
    ) {
        $this->logger = $logger;
        $this->exporter = $exporter;
        $this->writer = $writer;
        $this->settings = $settings;
        $this->siteSettings = $siteSettings;
    }

    public function __invoke(Event $event)
    {
        $request = $event->getParam('request');

        if (!in_array($request->getOperation(), ['create', 'batch_create', 'update'])) {
            return true;
        }

        $adapter = $event->getTarget();
        $entity = $event->getParam('entity');

        //@todo - move to factory.
        if ($entity instanceof SitePage) {
            $resource = new TranslatablePageResource(new SitePageRepresentation($entity, $adapter));
        } elseif ($entity instanceof Site) {
            $resource = new TranslatableNavigationResource(new SiteRepresentation($entity, $adapter));
        } elseif ($entity instanceof Item) {
            $resource = new TranslatableItemResource(new ItemRepresentation($entity, $adapter));
        } elseif ($entity instanceof ItemSet) {
            $resource = new TranslatableItemSetResource(new ItemSetRepresentation($entity, $adapter));
        } else {
            return true;
        }

        try {
            $locale = empty($this->settings->get('locale')) ? 'en_US' : $this->settings->get('locale');
            $this->exporter->export($locale, $resource, $this->writer);
        } catch (Throwable $ex) {
            $this->logger->err($ex->getMessage(), [
                'trace' => $ex->getTrace(),
            ]);
        }
    }
}

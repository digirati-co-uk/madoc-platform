<?php

namespace i18n\Resource;

use i18n\Resource\Exporter\TranslatableResourceExporter;
use i18n\Resource\Writer\TranslatableResourceWriter;
use Omeka\Api\Manager as ApiManager;
use Omeka\Api\Representation\SiteRepresentation;
use Throwable;

/**
 * Class TranslatableResourceManager.
 */
class TranslatableResourceManager
{
    /**
     * @var ApiManager
     */
    private $api;

    public function __construct(ApiManager $api)
    {
        $this->api = $api;
    }

    public function loadItems()
    {
        $resources = [];

        $items = $this->trySearch(
            'items',
            [
                'limit' => 1000,
            ]
        );

        foreach ($items as $item) {
            $resources[] = new TranslatableItemResource($item);
        }

        $itemSets = $this->trySearch('item_sets', [
            'limit' => 1000,
        ]);

        foreach ($itemSets as $item) {
            $resources[] = new TranslatableItemSetResource($item);
        }

        return $resources;
    }

    public function exportAllItems(
        string $locale,
        TranslatableResourceExporter $exporter,
        TranslatableResourceWriter $writer
    ) {
        $items = $this->loadItems();

        foreach ($items as $item) {
            $exporter->export($locale, $item, $writer);
        }
    }

    /**
     * Load all {@link TranslatableResource}s for the given {@code site}.
     *
     * @param SiteRepresentation $site
     *
     * @return array|TranslatableResource[]
     *
     * @throws TranslatableResourceException
     */
    public function load(SiteRepresentation $site): array
    {
        try {
            $resources = [];
            $resources[] = new TranslatableNavigationResource($site);

            $pages = $this->trySearch('site_pages', ['site_id' => $site->id()]);

            foreach ($pages as $page) {
                $resources[] = new TranslatablePageResource($page);
            }

            return $resources;
        } catch (Throwable $ex) {
            throw new TranslatableResourceException(
                sprintf("Unable to load translatable resources for site '%s'", $site->slug()),
                $ex
            );
        }
    }

    /**
     * Export all {@link TranslatableResource}s that exist for the given {@code site}.
     *
     * @param SiteRepresentation           $site
     * @param TranslatableResourceExporter $exporter
     * @param TranslatableResourceWriter   $writer
     */
    public function exportAll(
        string $locale,
        SiteRepresentation $site,
        TranslatableResourceExporter $exporter,
        TranslatableResourceWriter $writer
    ) {
        $resources = $this->load($site);

        foreach ($resources as $resource) {
            $exporter->export($locale, $resource, $writer);
        }
    }

    private function trySearch(string $type, array $options)
    {
        return $this->api->search($type, $options)->getContent();
    }
}

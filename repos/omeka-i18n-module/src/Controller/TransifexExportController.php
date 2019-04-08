<?php

namespace i18n\Controller;

use i18n\Framework\Support\AbstractPsr7ActionController;
use i18n\Resource\Exporter\TranslatableResourceExporter;
use i18n\Resource\TranslatableResourceManager;
use i18n\Resource\Writer\TranslatableResourceWriter;

class TransifexExportController extends AbstractPsr7ActionController
{
    public function exportAction()
    {
        $serviceLocator = $this->getEvent()->getApplication()->getServiceManager();
        $exporter = $serviceLocator->get(TranslatableResourceExporter::class);
        $writer = $serviceLocator->get(TranslatableResourceWriter::class);
        $manager = $serviceLocator->get(TranslatableResourceManager::class);

        $manager->exportAllItems('en_US', $exporter, $writer);
    }
}

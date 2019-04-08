<?php

namespace i18n\Job;

use BabDev\Transifex\Projects;
use i18n\Resource\Exporter\TranslatableResourceExporter;
use i18n\Resource\TranslatableResourceManager;
use i18n\Resource\Writer\TranslatableResourceWriter;
use Omeka\Api\Manager as ApiManager;
use Omeka\Job\AbstractJob;
use Omeka\Settings\Settings;

class TransifexItemExportJob extends AbstractJob
{
    /**
     * Perform this job.
     */
    public function perform()
    {
        $manager = $this->getResourceManager();

        $settings = $this->getSettings();
        $sourceLanguage = empty($settings->get('locale')) ? 'en_US' : $settings->get('locale');

        $exporter = $this->getServiceLocator()->get(TranslatableResourceExporter::class);
        $writer = $this->getServiceLocator()->get(TranslatableResourceWriter::class);

        $manager->exportAllItems($sourceLanguage, $exporter, $writer);
    }

    private function getApiManager(): ApiManager
    {
        return $this->getServiceLocator()->get('Omeka\ApiManager');
    }

    private function getProjects(): Projects
    {
        return $this->getServiceLocator()->get('transifex.projects');
    }

    private function getResourceManager(): TranslatableResourceManager
    {
        return $this->getServiceLocator()->get(TranslatableResourceManager::class);
    }

    private function getSettings(): Settings
    {
        return $this->getServiceLocator()->get('Omeka\Settings');
    }
}

<?php

namespace i18n\Job;

use BabDev\Transifex\Projects;
use GuzzleHttp\Exception\ClientException;
use i18n\Resource\Exporter\TranslatableResourceExporter;
use i18n\Resource\TranslatableResourceManager;
use i18n\Resource\Writer\TranslatableResourceWriter;
use Omeka\Api\Manager as ApiManager;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Job\AbstractJob;
use Omeka\Settings\Settings;

class TransifexExportJob extends AbstractJob
{
    /**
     * Perform this job.
     */
    public function perform()
    {
        $projects = $this->getProjects();
        $manager = $this->getResourceManager();
        $api = $this->getApiManager();

        $projectName = $this->getArg('site_slug');
        $projectSite = $api->read(
            'sites',
            [
                'slug' => $projectName,
            ]
        )->getContent();

        $settings = $this->getSettings();
        $sourceLanguage = $settings->get('locale', 'en_US');

        try {
            $response = $projects->getProject($projectName);
            if (200 !== $response->getStatusCode()) {
                throw new \RuntimeException('Got invalid response from transifex API');
            }
        } catch (ClientException $ex) {
            if (404 !== $ex->getResponse()->getStatusCode()) {
                throw $ex;
            }

            /* @var $projectSite SiteRepresentation */

            $projects->createProject(
                $projectSite->title(),
                $projectSite->slug(),
                'No description',
                $sourceLanguage,
                [
                    'private' => false,
                    'license' => 'proprietary',
                ]
            );
        }

        $exporter = $this->getServiceLocator()->get(TranslatableResourceExporter::class);
        $writer = $this->getServiceLocator()->get(TranslatableResourceWriter::class);

        $manager->exportAll($sourceLanguage, $projectSite, $exporter, $writer);
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

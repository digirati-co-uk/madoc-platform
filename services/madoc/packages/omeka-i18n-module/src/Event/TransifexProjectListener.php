<?php

namespace i18n\Event;

use BabDev\Transifex\Projects;
use GuzzleHttp\Exception\ClientException;
use Omeka\Entity\Site;
use Omeka\Entity\SitePage;
use Omeka\Settings\Settings;
use Omeka\Settings\SiteSettings;
use Zend\EventManager\Event;

class TransifexProjectListener
{
    /**
     * @var Projects
     */
    private $projects;

    /**
     * @var SiteSettings
     */
    private $siteSettings;

    public function __construct(Projects $projects, Settings $settings, SiteSettings $siteSettings)
    {
        $this->projects = $projects;
        $this->settings = $settings;
        $this->siteSettings = $siteSettings;
    }

    /**
     * @var Settings
     */
    private $settings;

    public function __invoke(Event $event)
    {
        $request = $event->getParam('request');
        $site = $event->getParam('entity');

        if (!in_array($request->getOperation(), ['create', 'batch_create']) || !($site instanceof Site || $site instanceof SitePage)) {
            return true;
        }

        if ($site instanceof SitePage) {
            $site = $site->getSite();
        }

        try {
            $response = $this->projects->getProject($site->getSlug());
            if (200 !== $response->getStatusCode()) {
                throw new \RuntimeException('Got invalid response from transifex API');
            }
        } catch (ClientException $ex) {
            if (404 !== $ex->getResponse()->getStatusCode()) {
                throw $ex;
            }

            $this->projects->createProject(
                $site->getTitle(),
                $site->getSlug(),
                'No description',
                $this->settings->get('locale') ?: 'en_US',
                [
                    'private' => true,
                    'license' => 'proprietary',
                ]
            );
        }

        return true;
    }
}

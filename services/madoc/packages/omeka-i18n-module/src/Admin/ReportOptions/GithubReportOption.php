<?php

namespace i18n\Admin\ReportOptions;

class GithubReportOption implements ReportOption
{
    /**
     * @var string
     */
    private $repo;
    /**
     * @var string
     */
    private $org;
    /**
     * @var string
     */
    private $issueTemplate;

    public function __construct(string $org, string $repo, string $issueTemplate = null)
    {
        $this->org = $org;
        $this->repo = $repo;
        $this->issueTemplate = $issueTemplate;
    }

    public function getLabel(string $verb = 'Report'): string
    {
        return $verb . ' on Github';
    }

    private function getQueryString(string $title = null) {
        $qs = $this->issueTemplate ? ['template' => $this->issueTemplate] : [];

        if ($title) {
            $qs['title'] = $title;
        }

        if (empty($qs)) {
            return '';
        }
        return '?' . http_build_query($qs);
    }

    public function getLink(string $title = null): string
    {
        return implode('/', [
            'http://github.com',
            $this->org,
            $this->repo,
            'issues/new' . $this->getQueryString($title),
        ]);
    }
}

<?php

namespace AnnotationStudio\CaptureModel;


use Digirati\OmekaShared\Helper\UrlHelper;
use Zend\Uri\Uri;

class Router
{

    /**
     * @var UrlHelper
     */
    private $url;

    /**
     * @var string
     */
    private $siteId;

    /**
     * @var Uri
     */
    private $domain;

    public function __construct(UrlHelper $url, string $domain)
    {
        $this->url = $url;
        $this->domain = new Uri($domain);
    }

    public function setSiteId(string $id)
    {
        $this->siteId = $id;
    }

    public function component($component, $moderation, $site = false)
    {
        return $this->url->create(
            $this->getRoute('component', $site),
            [
                'component' => $component,
                'moderation' => $moderation,
            ],
            $this->getOptions(),
            $site
        );
    }

    public function model($model, $component, $moderation, $site = false)
    {
        return $this->url->create(
            $this->getRoute('model', $site),
            [
                'model' => $model,
                'component' => $component,
                'moderation' => $moderation,
            ],
            $this->getOptions(),
            $site
        );
    }

    public function getOptions($moreOptions = [])
    {
        $options = [
            'force_canonical' => true
        ];

        if ($this->domain->isValid()) {
            $options['force_canonical'] = false;
            $options['uri'] = $this->domain;
        }

        return array_merge($options, $moreOptions);
    }

    public function getRoute(string $name, bool $site)
    {
        if ($site) {
            return "site/annotation-studio/$name";
        }
        return "annotation-studio/$name";
    }

}
<?php

namespace GoogleAnalytics\Events;

use Omeka\Settings\Settings;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use Zend\View\ViewEvent;

/**
 * A {@code ViewModel} event listener which modifies {@link View}s by appending a Google Analytics tracking script.
 */
final class GoogleScriptTagEventListener
{
    /**
     * A flag indicating if the Google Analytics script tag has already been shown.
     */
    private $shown = false;
    
    /**
     * Check if the passed {@link ViewEvent} is applicable for an analytics script tag to be inserted
     * into its root models content.
     *
     * @param ViewEvent $event the event being tested
     *
     * @return bool {@code true} iff this ViewEvent can have scripts appended to its ViewModel
     */
    public static function isApplicableEvent(ViewEvent $event)
    {
        $model = $event->getModel();

        if (!($model instanceof ViewModel)) {
            return false;
        }

        $children = $model->getChildren();

        if (1 !== count($children)) {
            return false;
        }

        $renderer = $event->getRenderer();

        if (!($renderer instanceof PhpRenderer)) {
            return false;
        }

        return true;
    }

    /**
     * @var Settings
     */
    private $settings;

    /**
     * @param Settings $settings
     */
    public function __construct(Settings $settings)
    {
        $this->settings = $settings;
    }

    public function __invoke(ViewEvent $event)
    {
        $trackingCode = $this->settings->get('google_analytics_key');

        if (empty($trackingCode) || !static::isApplicableEvent($event) || $this->shown) {
            return;
        }

        $model = $event->getModel();
        $children = $model->getChildren();
        $child = current($children);
        $childTemplate = $child->getTemplate();

        // Rudimentary test for pages we want to disable Google Analytics on.
        // @todo - this needs to be more robust
        if (false !== strpos($childTemplate, 'admin')) {
            return;
        }

        $renderer = $event->getRenderer();
        $jsTrackingCode = $renderer->escapeJs($trackingCode);

        $scriptContainer = $renderer->headScript();
        $scriptContainer->appendScript(<<<JS
 (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', '$jsTrackingCode', 'auto');
  ga('send', 'pageview');
JS
        );
        
        $this->shown = true;
    }
}

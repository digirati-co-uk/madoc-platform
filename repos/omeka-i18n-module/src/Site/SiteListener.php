<?php

namespace i18n\Site;

use Digirati\OmekaShared\Helper\LocaleHelper;
use Digirati\OmekaShared\Helper\UrlHelper;
use i18n\Module as I18nModule;
use i18n\Translator\ContextualTranslator;
use Omeka\Settings\Settings;
use Omeka\Settings\SiteSettings;
use Zend\EventManager\AbstractListenerAggregate;
use Zend\EventManager\EventManagerInterface;
use Zend\Http\Request;
use Zend\Mvc\Application;
use Zend\Mvc\MvcEvent;
use Zend\Session\Container as SessionContainer;

class SiteListener extends AbstractListenerAggregate
{
    const LOCALE_PARAM = 'locale';

    /**
     * @var LocaleHelper
     */
    private $localeHelper;
    /**
     * @var UrlHelper
     */
    private $urlHelper;

    public function __construct(
        LocaleHelper $localeHelper,
        UrlHelper $urlHelper
    ) {
        $this->localeHelper = $localeHelper;
        $this->urlHelper = $urlHelper;
    }

    /**
     * {@inheritdoc}
     */
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->listeners[] = $events->attach(MvcEvent::EVENT_DISPATCH, [$this, 'prepareLocale'], 2);
        $this->listeners[] = $events->attach(MvcEvent::EVENT_DISPATCH, [$this, 'prepareSiteContext'], 1);
    }

    public function prepareLocale(MvcEvent $event)
    {
        $services = $event->getApplication()->getServiceManager();
        /** @var Settings $settings */
        $settings = $services->get('Omeka\Settings');
        /** @var SiteSettings $siteSettings */
        $siteSettings = $services->get('Omeka\Settings\Site');
        $route = $event->getRouteMatch();
        /** @var Request $request */
        $request = $event->getRequest();

        $isOnSite = $route->getParam('__SITE__', false);

        $isMultiLingual = $isOnSite ? boolval($siteSettings->get('i18n-multi-lingual-site')) : false;
        $redirectMulti = $isOnSite ? boolval($siteSettings->get('i18n-redirect-from-multi-lingual')) : false;
        $globalLocale = $settings->get('locale');
        $fallbackLocale = $isOnSite ? $siteSettings->get('locale') : $globalLocale;
        $sessionManager = SessionContainer::getDefaultManager();
        $session = $sessionManager->getStorage();
        $routeLocale = (string)$route->getParam(self::LOCALE_PARAM);

        $localeHeaderValue = null;
        $localeHeader = $request->getHeaders()->get('X-Annotation-Studio-Locale');
        if (false !== $localeHeader) {
            $localeHeaderValue = $localeHeader->getFieldValue();
        }

        if (
            // If its configured
            $redirectMulti &&
            // And the sites not multilingual
            $isMultiLingual === false &&
            // And we are on a site
            $isOnSite &&
            // But its not an annotation studio request
            !$localeHeaderValue &&
            // But the url is /es/s/site-name
            $routeLocale
        ) {
            // Redirect to /s/site-name
            $url =  $this->urlHelper->create(
                null,
                [
                    'locale' => null,
                ],
                [],
                true
            );
            $response = $event->getResponse();
            $response->getHeaders()->addHeaderLine('Location', $url);
            $response->setStatusCode(302);
            return $response;
        }

        // By default.
        $locale = (string)$fallbackLocale ?: $globalLocale ?: 'en';

        // If multi-lingual is set.
        if ($isMultiLingual) {
            $locale = (string)($route->getParam(self::LOCALE_PARAM) ?? $session['locale'] ?? $localeHeaderValue ?? $locale);
        }

        $this->localeHelper->setLocale($locale);
        $session['locale'] = $locale;

//        /** @var TreeRouteStack $router */
//        $router = $event->getRouter();
//        $router->setDefaultParam(LocalizationListener::LOCALE_PARAM, $locale);

        return true;
    }

    public function prepareSiteContext(MvcEvent $event)
    {
        $services = $event->getApplication()->getServiceManager();
        if (!I18nModule::isFeatureFlagEnabled($services)) {
            return true;
        }

        $routeMatch = $event->getRouteMatch();
        if (!$routeMatch->getParam('__SITE__')) {
            return true;
        }

        $services = $event->getApplication()->getServiceManager();
        $slug = $event->getRouteMatch()->getParam('site-slug');
        $api = $services->get('Omeka\ApiManager');

        try {
            $site = $api->read('sites', ['slug' => $slug])->getContent();
        } catch (\Exception $e) {
            $event->setError(Application::ERROR_EXCEPTION);
            $event->setParam('exception', $e);
            $event->setName(MvcEvent::EVENT_DISPATCH_ERROR);
            $event->getApplication()->getEventManager()->triggerEvent($event);

            return false;
        }

        $services->get(ContextualTranslator::class)->setSite($site);

        return true;
    }
}

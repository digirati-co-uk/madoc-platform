<?php

namespace i18n\Site;

use i18n\Module as I18nModule;
use i18n\Translator\ContextualTranslator;
use Zend\EventManager\AbstractListenerAggregate;
use Zend\EventManager\EventManagerInterface;
use Zend\I18n\Translator\TranslatorInterface;
use Zend\Mvc\Application;
use Zend\Mvc\MvcEvent;
use Zend\Session\Container as SessionContainer;

class SiteListener extends AbstractListenerAggregate
{
    const LOCALE_PARAM = 'locale';

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

        $settings = $services->get('Omeka\Settings');
        $siteSettings = $services->get('Omeka\Settings\Site');

        $route = $event->getRouteMatch();
        $request = $event->getRequest();
        $globalLocale = $settings->get('locale');
        $fallbackLocale = $route->getParam('__SITE__', false) ? $siteSettings->get('locale') : $globalLocale;
        $sessionManager = SessionContainer::getDefaultManager();
        $session = $sessionManager->getStorage();

        $translator = $services->get(TranslatorInterface::class);
        $delegateTranslator = $translator->getDelegatedTranslator();

        $localeHeaderValue = null;
        $localeHeader = $request->getHeaders()->get('X-Annotation-Studio-Locale');
        if (false !== $localeHeader) {
            $localeHeaderValue = $localeHeader->getFieldValue();
        }

        $locale = $route->getParam(self::LOCALE_PARAM) ?? $session['locale'] ?? $localeHeaderValue ?? $fallbackLocale;

        if (null === $locale || empty($locale)) {
            $locale = 'en';
        }

        $viewHelperManager = $services->get('ViewHelperManager');
        $languageSwitcher = $viewHelperManager->get('locale');
        $languageSwitcher->setCurrentLocale($locale);
        $delegateTranslator->setLocale($locale);
        $session['locale'] = $locale;

        $event->getRouter()->setDefaultParam(LocalizationListener::LOCALE_PARAM, $locale);

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

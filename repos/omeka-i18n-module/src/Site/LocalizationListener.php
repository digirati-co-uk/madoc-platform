<?php

namespace i18n\Site;

use Omeka\I18n\Translator;
use Omeka\Settings\Settings;
use Omeka\Settings\SiteSettings;
use Zend\EventManager\EventManagerInterface;
use Zend\Mvc\I18n\Translator as MvcTranslator;
use Zend\Mvc\MvcEvent;
use Zend\Session\Container as SessionContainer;

/**
 * The {@code LocaleListener} will look at incoming {@link Request}s and decide the appropriate locale to be set on the
 * translator.  These 4 input sources are checked, in order, for a suitable locale:.
 *
 * <ol>
 * <li>Check for a _locale parameter on the accessed route</li>
 * <li>Check for a configured locale in session object</li>
 * <li>Check for a default locale specific to the current site</li>
 * <li>Fallback to the globally configured default locale</li>
 * </ol>
 */
class LocalizationListener
{
    const LOCALE_PARAM = 'locale';

    /**
     * @var Settings
     */
    private $settings;

    /**#
     * @var SiteSettings
     */
    private $siteSettings;

    /**
     * @var MvcTranslator
     */
    private $translator;

    public function __construct(Settings $settings, SiteSettings $siteSettings, Translator $translator)
    {
        $this->settings = $settings;
        $this->siteSettings = $settings;
        $this->translator = $translator;
    }

    public function __invoke(MvcEvent $event)
    {
        $route = $event->getRouteMatch();
        $globalLocale = $this->settings->get('locale');
        $fallbackLocale = $route->getParam('__SITE__', false) ? $this->siteSettings->get('locale') : $globalLocale;

        $sessionManager = SessionContainer::getDefaultManager();
        $session = $sessionManager->getStorage();

        $delegateTranslator = $this->translator->getDelegatedTranslator();
        $locale = $route->getParam(self::LOCALE_PARAM) ?? $session['locale'] ?? $fallbackLocale;

        if (null === $locale || empty($locale)) {
            $locale = 'en';
        }

        $delegateTranslator->setLocale($locale);
        $event->getRouter()->setDefaultParam(LocalizationListener::LOCALE_PARAM, $locale);

        return true;
    }

    public function attach(EventManagerInterface $events)
    {
        $events->attach(MvcEvent::EVENT_ROUTE, $this, 1);
    }
}

<?php

namespace i18n\Site;

use Locale;
use Omeka\I18n\Translator;
use Omeka\Settings\Settings;
use Omeka\Settings\SiteSettings;
use Zend\EventManager\EventManagerInterface;
use Zend\Mvc\I18n\Translator as MvcTranslator;
use Zend\Mvc\MvcEvent;
use Zend\Router\Http\TreeRouteStack;
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
        $this->siteSettings = $siteSettings;
        $this->translator = $translator;
    }

    public function __invoke(MvcEvent $event)
    {
        $route = $event->getRouteMatch();
        $globalLocale = $this->settings->get('locale');
        $isOnSite = $route->getParam('__SITE__', false);
        $fallbackLocale = $isOnSite ? $this->siteSettings->get('locale') : $globalLocale;
        $routerLocale = $route->getParam(self::LOCALE_PARAM);

        $sessionManager = SessionContainer::getDefaultManager();
        $session = $sessionManager->getStorage();

        /** @var \Zend\I18n\Translator\Translator $delegateTranslator */
        $delegateTranslator = $this->translator->getDelegatedTranslator();

        $madocTranslationPaths = [
            [OMEKA_PATH . '/translations/madoc', 'default'],
            [OMEKA_PATH . '/translations/s/' . $route->getParam('site-slug') . '/page-blocks', 'default:page_block'],
            [OMEKA_PATH . '/translations/s/' . $route->getParam('site-slug') . '/navigation', 'default:navigation'],
        ];

        foreach ($madocTranslationPaths as $path) {
            $delegateTranslator->addTranslationFilePattern(
                'gettext',
                $path[0],
                '%s.mo',
                $path[1]
            );
        }

        $locale = $route->getParam(self::LOCALE_PARAM) ?? $session['locale'] ?? $fallbackLocale;

        if (null === $locale || empty($locale)) {
            $locale = 'en';
        }

        $isMultilingual = $isOnSite ? boolval($this->siteSettings->get('i18n-multi-lingual-site')) : false;
        /** @var TreeRouteStack $router */
        $router = $event->getRouter();

        $uriLocale = ($isMultilingual && $routerLocale) ? $locale : null;

        $router->setDefaultParam(LocalizationListener::LOCALE_PARAM, $uriLocale);

        if (extension_loaded('intl')) {
            Locale::setDefault($locale);
        }

        $delegateTranslator->setLocale($locale);

        return true;
    }

    public function attach(EventManagerInterface $events)
    {
        $events->attach(MvcEvent::EVENT_ROUTE, $this, 1);
    }
}

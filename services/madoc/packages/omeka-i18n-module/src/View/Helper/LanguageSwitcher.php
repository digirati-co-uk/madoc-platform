<?php

namespace i18n\View\Helper;

use Digirati\OmekaShared\Helper\LocaleHelper;
use Digirati\OmekaShared\Helper\UrlHelper;
use Zend\I18n\Translator\TranslatorInterface;
use Zend\View\Helper\AbstractHelper;

class LanguageSwitcher extends AbstractHelper
{
    /**
     * @var array<string, string>
     */
    private static $DEFAULT_LANGUAGE_MAP = [
        'en' => 'English', //@translate
    ];

    /**
     * @var TranslatorInterface
     */
    private $translator;
    /**
     * @var array
     */
    private $languageMap;
    /**
     * @var LocaleHelper
     */
    private $localeHelper;
    /**
     * @var UrlHelper
     */
    private $urlHelper;

    public function __construct(
        TranslatorInterface $translator,
        LocaleHelper $localeHelper,
        UrlHelper $urlHelper,
        $languageMap = null
    ) {
        $this->translator = $translator;
        $this->localeHelper = $localeHelper;
        $this->urlHelper = $urlHelper;
        $this->languageMap = $languageMap ?? self::$DEFAULT_LANGUAGE_MAP;
    }

    public function __invoke()
    {
        $selected = $this->currentLocale();

        $languages = $this->languageMap;

        unset($languages[$selected]);

        $languageOptions = [];

        foreach ($languages as $locale => $label) {
            $currentUri = $this->urlHelper->create(
                null,
                [
                    'locale' => $locale,
                ],
                [],
                true
            );

            $languageOption = [
                'uri' => $this->urlHelper->create(
                    'i18n-language-select',
                    [
                        'newLocale' => $locale,
                        'locale' => $locale,
                    ],
                    [
                        'query' => [
                            'r' => $currentUri,
                        ],
                    ]
                ),
                'label' => $this->translator->translate($label),
            ];

            $languageOptions[] = $languageOption;
        }

        return $languageOptions;
    }

    public function currentLocale()
    {
        return $this->localeHelper->getLocale();
    }
}

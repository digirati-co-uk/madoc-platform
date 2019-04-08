<?php

namespace i18n\View\Helper;

use Zend\I18n\Translator\TranslatorInterface;
use Zend\View\Helper\AbstractHelper;

class LanguageSwitcher extends AbstractHelper
{
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

    public function __construct(TranslatorInterface $translator, $languageMap = null)
    {
        $this->translator = $translator;
        $this->languageMap = $languageMap ?? self::$DEFAULT_LANGUAGE_MAP;
    }

    public function __invoke()
    {
        $selected = $this->getView()->locale() ?: 'en'; // @todo - fetch from "default locale"

        $languages = $this->languageMap;
        unset($languages[$selected]);

        $languageOptions = [];

        foreach ($languages as $locale => $label) {
            $currentUri = $this->getView()->url(
                null,
                [
                    'locale' => $locale,
                ],
                [],
                true
            );

            $languageOption = [
                'uri' => $this->getView()->url(
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
        return $this->selected;
    }
}

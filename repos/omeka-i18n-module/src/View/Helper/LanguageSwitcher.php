<?php

namespace i18n\View\Helper;

use Zend\I18n\Translator\TranslatorInterface;
use Zend\View\Helper\AbstractHelper;

class LanguageSwitcher extends AbstractHelper
{
    private static $languages = [
        'en' => 'English', //@translate
        'cy' => 'Cymraeg', //@translate
    ];

    /**
     * @var TranslatorInterface
     */
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function __invoke()
    {
        $selected = $this->getView()->locale() ?: 'en';

        $languages = self::$languages;
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

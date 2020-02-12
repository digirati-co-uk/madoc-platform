<?php

namespace i18n\View\Helper;

use Zend\View\Helper\AbstractHelper;

class Locale extends AbstractHelper
{
    /**
     * @var string
     */
    private $selected = 'en';

    public function setCurrentLocale($current)
    {
        if (empty($current) || !is_string($current)) {
            $this->selected = 'en';

            return;
        }

        $this->selected = $current;
    }

    public function __invoke()
    {
        return $this->selected ?: 'en';
    }

    public function currentLocale()
    {
        return $this->selected;
    }
}

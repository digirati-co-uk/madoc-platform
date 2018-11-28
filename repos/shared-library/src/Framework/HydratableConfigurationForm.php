<?php


namespace Digirati\OmekaShared\Framework;


use Omeka\Settings\Settings;
use Zend\Mvc\Controller\AbstractController;

interface HydratableConfigurationForm
{
    public static function fromSettings(Settings $settings, $form = null): HydratableConfigurationForm;

    public static function fromPost(array $postData, $form = null): HydratableConfigurationForm;
}

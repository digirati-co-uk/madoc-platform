<?php
namespace Digirati\OmekaShared\ModuleExtensions;

use Digirati\OmekaShared\Framework\HydratableConfigurationForm;
use LogicException;
use Omeka\Settings\Settings;
use Zend\Mvc\Controller\AbstractController;
use Zend\View\Renderer\PhpRenderer;

trait ConfigurationFormAutoloader
{
    abstract function getConfigFormClass(): string;

    /** @return \Zend\Di\ServiceLocator */
    abstract public function getServiceLocator();

    public function getConfigForm(PhpRenderer $renderer)
    {
        $configFormClass = $this->getConfigFormClass();
        if (
            !class_exists($configFormClass) ||
            !in_array(HydratableConfigurationForm::class, class_implements($configFormClass))
        ) {
            throw new LogicException('`getConfigFormClass` must return valid fully qualified class name');
        }

        /** @var Settings $settings */
        $settings = $this->getServiceLocator()->get('Omeka\Settings');

        /** @var \Zend\Form\Form $form */
        $form = $configFormClass::fromSettings($settings);
        return $renderer->formCollection($form, false);
    }

    public function handleConfigForm(AbstractController $controller)
    {
        $configFormClass = $this->getConfigFormClass();
        if (
            !class_exists($configFormClass) ||
            !in_array(HydratableConfigurationForm::class, class_implements($configFormClass))
        ) {
            throw new LogicException('`getConfigFormClass` must return valid fully qualified class name');
        }

        /** @var Settings $settings */
        $settings = $this->getServiceLocator()->get('Omeka\Settings');

        /** @var \Zend\Form\Form $form */
        $form = $configFormClass::fromPost($controller->params()->fromPost());
        if (!$form->isValid()) {
            $controller->messenger()->addErrors($form->getMessages());
            return false;
        }
        return $form->saveToSettings($settings);
    }
}

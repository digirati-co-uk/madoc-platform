<?php

namespace PublicUser\Module;

use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Api\Response;
use Psr\Container\ContainerInterface;
use Zend\Mvc\Controller\AbstractController;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;

trait ConfigForm
{
    /** @return ContainerInterface */
    abstract public function getServiceLocator();

    /**
     * Get this module's configuration form.
     *
     * @param PhpRenderer $renderer
     *
     * @return string
     */
    public function getConfigForm(PhpRenderer $renderer)
    {
        $apiManager = $this->getServiceLocator()->get('Omeka\ApiManager');
        $globalSettings = $this->getServiceLocator()->get('Omeka\Settings');

        $public_user_settings = $globalSettings->get('publicuser');
        /** @var Response $response */
        $response = $apiManager->search('sites', []);
        /** @var SiteRepresentation[] $sites */
        $sites = $response->getContent();

        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $roles = $acl->getRoleLabels();

        $form = $this->getServiceLocator()->get('FormElementManager')->get('publicuserconfig',
            [
                'options' => [
                    'sites' => $sites,
                    'roles' => $roles,
                    'settings' => $public_user_settings,
                ],
            ]
        );

        $view = new ViewModel([
            'form' => $form,
            'sites' => $sites,
        ]);
        $view->setTemplate('config/configform.phtml');

        return $renderer->render($view);
    }

    /**
     * Handle this module's configuration form.
     *
     * @param AbstractController $controller
     *
     * @return bool False if there was an error during handling
     */
    public function handleConfigForm(AbstractController $controller)
    {
        $globalSettings = $this->getServiceLocator()->get('Omeka\Settings');

        $formData = $controller->params()->fromPost();

        $settings = [];

        foreach ($formData as $fieldName => $formValue) {
            if (strstr($fieldName, '__global__')) {
                list(, $fieldNameNormalized) = explode('__global__', $fieldName);
                $settings['__global__'][$fieldNameNormalized] = $formValue;
                unset($formData[$fieldName]);
            }
        }

        foreach ($formData as $fieldName => $formValue) {
            $parts = explode('_', $fieldName);
            $slug = array_shift($parts);
            $settings[$slug][$fieldName] = $formValue;
        }

        $globalSettings->set('publicuser', $settings);

        return true;
    }
}

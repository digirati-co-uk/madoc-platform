<?php

namespace PublicUser\Controller;

use Omeka\Api\Manager;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ResourceTemplateRepresentation;
use Omeka\Api\Response;
use Omeka\Entity\User;
use Omeka\View\Helper\Api;
use PublicUser\Form\ResourceForm;
use PublicUser\Settings\PublicUserSettings;
use Zend\Authentication\AuthenticationServiceInterface;
use Zend\Form\Element\Submit;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class UserProfileController extends AbstractActionController
{
    /**
     * @var AuthenticationServiceInterface
     */
    private $auth;

    /**
     * @var Manager
     */
    private $api;

    /**
     * @var PublicUserSettings
     */
    private $settings;

    public function __construct(Manager $api, AuthenticationServiceInterface $auth, PublicUserSettings $settings)
    {
        $this->api = $api;
        $this->auth = $auth;
        $this->settings = $settings;
    }

    public function editAction()
    {
        if (!$this->settings->isUserProfilesEnabled() || !$this->auth->hasIdentity()) {
            return $this->notFoundAction();
        }

        /** @var Api $api */
        $api = $this->api();
        /** @var User $user */
        $user = $this->auth->getIdentity();
        $userId = $user->getId();
        /** @var ItemRepresentation $userIdProperty */
        $userIdProperty = $api->searchOne('properties', ['term' => 'dcterms:identifier'])->getContent();

        $profileResourceTemplateId = $this->settings->getUserProfilesResourceTemplate();
        /** @var ResourceTemplateRepresentation $profileResourceTemplate */
        $profileResourceTemplate = $api->read('resource_templates', $profileResourceTemplateId)->getContent();
        $uidKey = "user:$userId";

        /** @var Response $profileItem */
        $profileItem = $api->searchOne('items',
            [
                'property' => [
                    [
                        'joiner' => 'and',
                        'property' => $userIdProperty->id(),
                        'type' => 'eq',
                        'text' => $uidKey,
                    ],
                ],
            ]
        );

        $profileItemExists = 0 !== $profileItem->getTotalResults();
        $profileSensitiveData = [
            'o:resource_template' => [
                'o:id' => $profileResourceTemplateId,
            ],
            'dcterms:identifier' => [
                [
                    'type' => 'literal',
                    'property_id' => $userIdProperty->id(),
                    '@value' => $uidKey,
                ],
            ],
        ];

        $profileData = $profileItemExists ? json_decode(json_encode($profileItem->getContent()), true) : [];
        /** @var ResourceForm $profileForm */
        $profileForm = $this->getForm(ResourceForm::class, [
            'resource_template' => $profileResourceTemplate,
            'read_only_properties' => ['dcterms:identifier'],
        ]);
        $profileFormSubmit = new Submit('submit');
        $profileFormSubmit->setValue('Save changes');

        /** @var \Zend\Http\Request $request */
        $request = $this->getRequest();
        $profileInputData = $request->isPost() ? (array) $request->getPost() : [];
        $profileForm->add($profileFormSubmit);
        $profileForm->setData(array_replace_recursive($profileData, $profileInputData));

        if ($request->isPost()) {
            if ($profileForm->isValid()) {
                $sanitizedProfileData = array_replace($profileForm->getData(), $profileSensitiveData);

                if ($profileItemExists) {
                    $this->api($profileForm)->update(
                        'items',
                        $profileItem->getContent()->id(),
                        $sanitizedProfileData
                    );
                } else {
                    $this->api($profileForm)->create('items', $sanitizedProfileData);
                }
            }
        }

        $viewModel = new ViewModel();
        $viewModel->setVariables([
            'profile_form' => $profileForm,
        ]);

        return $viewModel;
    }
}

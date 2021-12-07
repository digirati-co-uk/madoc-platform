<?php

namespace PublicUser\Controller;

use LogicException;
use Doctrine\ORM\EntityManager;
use Omeka\Settings\Settings;
use PublicUser\Stats\AnnotationStatisticsService;
use PublicUser\Stats\BookmarksService;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\EventDispatcher\GenericEvent;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Omeka\Form\UserForm;

class AccountController extends AbstractActionController
{
    /**
     * @var AnnotationStatisticsService
     */
    private $statistics;

    /**
     * @var BookmarksService
     */
    private $bookmarks;
    /**
     * @var Settings
     */
    private $settings;
    /**
     * @var EventDispatcher
     */
    private $eventDispatcher;

    public function __construct(
        EntityManager $entityManager,
        AnnotationStatisticsService $statistics,
        BookmarksService $bookmarks,
        Settings $settings,
        EventDispatcher $eventDispatcher
    ) {
        $this->entityManager = $entityManager;
        $this->statistics = $statistics;
        $this->bookmarks = $bookmarks;
        $this->settings = $settings;
        $this->eventDispatcher = $eventDispatcher;
    }

    public function profileAction()
    {
        $user = $this->identity();

        if (is_null($user)) {
            return $this->redirect()->toUrl($this->currentSite()->siteUrl());
        }

        $uid = $user->getId();
        $bookmarks = $this->bookmarks->getBookmarks($uid);
        $stats = $this->statistics->getUserStats($uid);

        $view = new ViewModel();

        $options =
            [
                'include_role' => false,
                'include_admin_roles' => false,
                'include_is_active' => false,
                'include_password' => true,
                'current_password' => true,
                'include_key' => false,
            ];

        $statistics = [
            [
                'label' => 'Bookmarked images', // @translate
                'value' => $stats->getBookmarks(),
            ],
            [
                'label' => 'Images annotated', // @translate
                'value' => $stats->getIncompleteImages(),
            ],
            [
                'label' => 'Total annotations', // @translate
                'value' => $stats->getIncompleteAnnotations() + $stats->getCompleteAnnotations(),
            ],
        ];

        /** @var UserForm $form */
        $form = $this->getForm(UserForm::class, $options);
        $form->setSettings($this->settings);
        $form->init();

        $formData = [
            'user-information' => [
                'o:email' => $user->getEmail(),
                'o:name' => $user->getName(),
            ],
        ];

        $form->setData($formData);

        $returnError = function () use ($view, $form, $statistics, $user) {
            $view->setVariable('form', $form);

            $this->messenger()->addFormErrors($form);

            $view->setVariable('form', $form);
            $view->setVariable('user', $user);
            $view->setVariable('statistics', $statistics);

            return $view;
        };

        if ($this->getRequest()->isPost()) {
            $postData = $this->params()->fromPost();
            $form->setData($postData);
            if ($form->isValid()) {
                $values = $form->getData();
                $passwordValues = $values['change-password'];
                $response = $this->api()->update('users', $uid, $values['user-information']);

                if (!$response) {
                    $this->messenger()->addError('Something went wrong updating your details.'); // @translate

                    return $returnError();
                }

                if (!empty($passwordValues['password'])) {
                    if (!$this->userIsAllowed($user, 'change-password')) {
                        throw new Exception\PermissionDeniedException(
                            'User does not have permission to change the password'
                        );
                    }
                    if ($user && !$user->verifyPassword($passwordValues['current-password'])) {
                        $this->messenger()->addError('The current password entered was invalid'); // @translate

                        return $returnError();
                    } else {
                        $user->setPassword($passwordValues['password']);
                        $successMessages[] = 'Password successfully changed'; // @translate
                    }
                }

                $this->entityManager->flush();

                if (isset($successMessages) && is_array($successMessages)) {
                    foreach ($successMessages as $message) {
                        $this->messenger()->addSuccess($this->translate($message));
                    }
                }
            } else {
                $this->messenger()->addFormErrors($form);
            }
        }

        $view->setVariable('form', $form);
        $view->setVariable('user', $user);
        $view->setVariable('slug', $this->currentSite()->slug());
        $view->setVariable('messages', $this->messenger()->get());
        $view->setVariable('canvases', $bookmarks);
        $view->setVariable('statistics', $statistics);

        $this->eventDispatcher->dispatch('user.profile', new GenericEvent($view, [
            'user' => $user,
        ]));

        return $view;
    }


    public function validate()
    {

    }

    public function editDetailsAction()
    {
        throw new LogicException('Action not yet implemented');
    }
}

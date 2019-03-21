<?php

namespace PublicUser\Controller;

use LogicException;
use Doctrine\ORM\EntityManager;
use PublicUser\Stats\AnnotationStatisticsService;
use PublicUser\Stats\BookmarksService;
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

    public function __construct(
        EntityManager $entityManager,
        AnnotationStatisticsService $statistics,
        BookmarksService $bookmarks
    ) {
        $this->entityManager = $entityManager;
        $this->statistics = $statistics;
        $this->bookmarks = $bookmarks;
    }

    public function profileAction()
    {
        $user = $this->identity();

        if (is_null($user)) {
            return $this->redirect()->toUrl($this->currentSite()->siteUrl());
        }

        $uid = $user->getId();
        // @todo this will not work until the query is join from Items
//        $bookmarks = $this->bookmarks->getBookmarks($uid);
        $stats = $this->statistics->getUserStats($uid);

        $view = new ViewModel();

        $options =
            [
                'include_role' => false,
                'include_admin_roles' => false,
                'include_is_active' => false,
                'include_password' => true,
                'current_password' => false,
                'include_key' => false,
            ];

        $manifest = [
            'statistics' => [
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
            ],
        ];

        $form = new UserForm('userForm', $options);
        $form->init();

        $formData = [
            'user-information' => [
                'o:email' => $user->getEmail(),
                'o:name' => $user->getName(),
            ],
        ];

        $form->setData($formData);

        if ($this->getRequest()->isPost()) {
            $postData = $this->params()->fromPost();
            $form->setData($postData);
            if ($form->isValid()) {
                $values = $form->getData();
                $passwordValues = $values['change-password'];
                $response = $this->api($form)->update('users', $uid, $values['user-information']);

                // Stop early if the API update fails
                if (!$response) {
                    $view->setVariable('form', $form);

                    $this->messenger()->addFormErrors($form);

                    $view->setVariable('form', $form);
                    $view->setVariable('user', $user);
                    $view->setVariable('messages', $this->messenger()->get());
                    $view->setVariable('manifest', $manifest);

                    $this->messenger()->clear();

                    return $view;
                }
                $this->messenger()->addSuccess($this->translate('User successfully updated')); // @translate

                if (!empty($passwordValues['password'])) {
                    if (!$this->userIsAllowed($user, 'change-password')) {
                        throw new Exception\PermissionDeniedException(
                            'User does not have permission to change the password'
                        );
                    }
                    if ($user && !$user->verifyPassword($passwordValues['current-password'])) {
                        $this->messenger()->addError('The current password entered was invalid'); // @translate
                    }
                    $user->setPassword($passwordValues['password']);
                    $successMessages[] = 'Password successfully changed'; // @translate
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
        $view->setVariable('messages', $this->messenger()->get());
        $view->setVariable('manifest', $manifest);
        $view->setVariable('canvases', $bookmarks);

        $this->messenger()->clear();

        return $view;
    }

    public function editDetailsAction()
    {
        throw new LogicException('Action not yet implemented');
    }
}

<?php

namespace PublicUser\Controller;

use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use Digirati\OmekaShared\Helper\SitePermissionsHelper;
use Doctrine\ORM\EntityManager;
use Omeka\Entity\Site;
use Omeka\Entity\User;
use Omeka\Mvc\Controller\Plugin\Messenger;
use Omeka\Mvc\Exception\NotFoundException;
use PublicUser\Form\AdminInvitationForm;
use PublicUser\Invitation\InvitationService;
use PublicUser\Settings\PublicUserSettings;
use Zend\Authentication\AuthenticationService;

class AdminInvitationsController extends AbstractPsr7ActionController
{
    /**
     * @var InvitationService
     */
    private $service;
    /**
     * @var AuthenticationService
     */
    private $authentication;
    /**
     * @var PublicUserSettings
     */
    private $settings;
    /**
     * @var EntityManager
     */
    private $entityManager;

    public function __construct(
        InvitationService $service,
        AuthenticationService $authentication,
        PublicUserSettings $settings,
        EntityManager $entityManager
    ) {
        $this->service = $service;
        $this->authentication = $authentication;
        $this->settings = $settings;
        $this->entityManager = $entityManager;
    }

    public function removeAction()
    {
        if ($this->getRequest()->isPost()) {
            $invitationId = $this->params()->fromPost('invitation_id');
            $invitation = $this->service->getInvitation($invitationId);
            if ($invitation) {
                $site = $this->currentSite();
                /** @var User $user */
                $user = $this->authentication->getIdentity();

                $canDeleteOthers = SitePermissionsHelper::isUserAdmin($user, $site);

                if ((string)$user->getId() !== $invitation->ownerId && !$canDeleteOthers) {
                    throw new NotFoundException();
                }

                $this->service->revokeInvitation($invitation);
                $this->messenger()->addSuccess('Removed the invitation');
            } else {
                $this->messenger()->addError('Invitation does not exist, cannot delete');
            }
        }
        return $this->redirect()->toRoute('public-user-invitations',[], [], true);
    }

    public function listAction()
    {
        $site = $this->currentSite();

        /** @var AdminInvitationForm $form */
        $form = $this->getForm(AdminInvitationForm::class);

        /** @var User $user */
        $user = $this->authentication->getIdentity();
        if ($this->getRequest()->isPost()) {

            $data = $this->getRequest()->getPost();

            $form->setData($data);

            if ($form->isValid()) {
                // Add invitation here.
                // @todo pass anything that might be needed here.
                $site = $this->currentSite();
                $this->service->createInvitation(
                    $site->id(),
                    $data['site-role'],
                    $data['message'] ?: $user->getName() . " invited you to contribute to " . $site->title()
                );
            }
            $this->redirect()->toRoute(null, [], [], true);
        }

        /** @var $message Messenger */
        $message = $this->messenger();
        $defaultSiteId = $this->settings()->get('default_site');
        $inviteSiteSlug = $site->slug();

        if (!$this->settings->getInviteOnlyStatus() && $site->isPublic()) {
            $message->addWarning(
                'Warning, your site is not configured to only allow registrations for invited users ' .
                'you can change this setting under "Settings" on the left navigation under your site.'
            );
        } else if (!$defaultSiteId && $site->isPublic() === false) {
            $inviteSiteSlug = null;
            $message->addWarning(
                'If you want users to be able to register to your site (while not public) you need to ' .
                'set up a default site to allow them to register.'
            );
        } else {
            if ($site->isPublic() === false) {
                $defaultSite = $this->entityManager->find(Site::class, $defaultSiteId);
                $inviteSiteSlug = $defaultSite->getSlug();
            }
            $message->addSuccess('🎉 Your site is configured to be invite only, you can generate invite links below');
        }


        // Pass in user ID to filter if not an admin.
        $isAdmin = SitePermissionsHelper::isUserAdmin($user, $site);
        $userId = $isAdmin ? $user->getId() : null;
        $invitations = $this->service->listInvitations($site->id(), $userId);


        $matrix = [];
        foreach (PublicUserSettings::APPLY_CUSTOM_SITE_PERMISSION_TO_ROLES as $userRole) {
            $perms = [
                'key' => $userRole,
                'label' => PublicUserSettings::ADDITIONAL_ROLES[$userRole],
                'permissions' => [],
            ];
            foreach (PublicUserSettings::CUSTOM_SITE_PERMISSIONS as $perm) {
                $perms['permissions'][] = [
                    'permission' => $perm,
                    'value' => $this->settings->canUserWithRole($userRole, $perm),
                ];
            }
            $matrix[] = $perms;
        }


        return ['createNew' => $form, 'invitations' => $invitations, 'inviteSlug' => $inviteSiteSlug, 'matrix' => $matrix, 'showDelete' => $isAdmin ];
    }
}

<?php

namespace PublicUser\Invitation;

use DateTime;
use Error;
use Exception;
use Omeka\Entity\User;
use PublicUser\Entity\Invitation;
use Throwable;
use Zend\Authentication\AuthenticationService;

class InvitationService
{
    /**
     * @var InvitationStorage
     */
    private $storage;
    /**
     * @var InvitationSettings
     */
    private $settings;
    /**
     * @var AuthenticationService
     */
    private $auth;

    public function __construct(
        InvitationStorage $storage,
        InvitationSettings $settings,
        AuthenticationService $auth
    ) {
        $this->storage = $storage;
        $this->settings = $settings;
        $this->auth = $auth;
    }

    // List all invitations by user id
    public function listInvitations(string $siteId, string $userId = null): array
    {
        return $this->storage->listInvitations($siteId, $userId);
    }

    /**
     * @param int $siteId
     * @param string $siteRole
     * @param string $message
     * @throws Exception
     */
    public function createInvitation(int $siteId, string $siteRole, $message = '')
    {
        $invitationId = bin2hex(random_bytes($this->settings->getInviteTokenLength()));

        $ownerId = $this->getCurrentUser()->getId();

        $expire = $this->settings->getDefaultExpiryTime();

        $invitations = new Invitation(
            -1,
            $invitationId,
            $ownerId,
            $siteId,
            $this->settings->getDefaultRole(),
            $siteRole ? $siteRole : $this->settings->getDefaultSiteRole(),
            new DateTime(date("Y-m-d H:i:s", strtotime("+$expire sec"))),
            new DateTime(),
            $this->settings->getMaxUses(),
            $message
        );

        $this->storage->saveInvitation($invitations);
    }

    public function getCurrentUser(): User
    {
        return $this->auth->getIdentity();
    }

    // Revoke invite links
    public function revokeInvitation(Invitation $invitation)
    {
        $this->storage->deleteInvitation($invitation->invitationId);
    }

    /**
     * @param Invitation $invitation
     * @param string $site
     *
     * @throws Exception
     */
    public function redeemInvitation(Invitation $invitation)
    {
        if (!$this->isValidInvitation($invitation->invitationId)) {
            throw new Exception('Invalid invitation');
        }

        $invitation->usesLeft = $invitation->usesLeft - 1;

        $this->storage->saveInvitation($invitation);
    }

    /**
     * @param string $inviteId
     * @return Invitation | null
     */
    public function getInvitation(string $inviteId)
    {
        return $this->storage->getInvitation($inviteId);
    }

    /**
     * @param string $inviteId
     * @return Invitation | null
     * @throws Exception
     */
    public function isValidInvitation(string $inviteId)
    {
        try {
            $invitation = $this->getInvitation($inviteId);
        } catch (Throwable $exception) {
            return null;
        }

        if (!$invitation) {
            error_log("Invitation($inviteId) not found");
            return null;
        }

        if ($invitation->expires < new DateTime()) {
            error_log("Invitation($inviteId) expired");
            return null;
        }

        if ($invitation->usesLeft <= 0) {
            error_log("Invitation($inviteId) ran out of uses");
            return null;
        }

        return $invitation;
    }

}

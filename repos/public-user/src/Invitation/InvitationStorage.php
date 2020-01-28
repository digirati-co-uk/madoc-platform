<?php

namespace PublicUser\Invitation;

use DateTime;
use Doctrine\DBAL\Connection;
use PublicUser\Entity\Invitation;

class InvitationStorage
{
    /**
     * @var Connection
     */
    private $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function listInvitations(string $siteId, string $userId = null): array
    {
        $invitations = $userId
            ? $this->connection->fetchAll(
                'SELECT 
                    id,
                    invitation_id,
                    owner_id,
                    site_id,
                    role,
                    site_role,
                    expires,
                    created_at,
                    uses_left,
                    message
                 FROM user_invitations
                 WHERE owner_id = ? AND
                       site_id = ?
                ',
                [$userId, $siteId]
            )
            : $this->connection->fetchAll(
                'SELECT 
                    id,
                    invitation_id,
                    owner_id,
                    site_id,
                    role,
                    site_role,
                    expires,
                    created_at,
                    uses_left,
                    message
                 FROM user_invitations
                 WHERE site_id = ?
                ',
                [$siteId]
            );

        if (!$invitations) {
            return [];
        }

        return array_map([$this, 'mapInvitationRow'], $invitations);
    }

    public function mapInvitationRow(array $invitation): Invitation
    {
        return new Invitation(
            $invitation['id'],
            $invitation['invitation_id'],
            $invitation['owner_id'],
            $invitation['site_id'],
            $invitation['role'],
            $invitation['site_role'],
            new DateTime($invitation['expires']),
            new DateTime($invitation['created_at']),
            $invitation['uses_left'],
            $invitation['message']
        );
    }

    public function saveInvitation(Invitation $invitation)
    {
        if ($invitation->id && $invitation->id !== -1) {
            $this->connection->update(
                'user_invitations',
                [
                    'invitation_id' => $invitation->invitationId,
                    'owner_id' => $invitation->ownerId,
                    'role' => $invitation->role,
                    'site_role' => $invitation->siteRole,
                    'expires' => $invitation->expires,
                    'created_at' => $invitation->createdAt,
                    'uses_left' => $invitation->usesLeft,
                    'message' => $invitation->message,
                    'site_id' => $invitation->siteId,
                ],
                ['id' => $invitation->id],
                [
                    'string',
                    'string',
                    'string',
                    'string',
                    'datetime',
                    'datetime',
                    'string',
                    'string',
                    'string',
                ]
            );
        } else {
            $this->connection->insert('user_invitations',
                [
                    'invitation_id' => $invitation->invitationId,
                    'owner_id' => $invitation->ownerId,
                    'role' => $invitation->role,
                    'site_role' => $invitation->siteRole,
                    'expires' => $invitation->expires,
                    'created_at' => $invitation->createdAt,
                    'uses_left' => $invitation->usesLeft,
                    'message' => $invitation->message,
                    'site_id' => $invitation->siteId,
                ],
                [
                    'string',
                    'string',
                    'string',
                    'string',
                    'datetime',
                    'datetime',
                    'string',
                    'string',
                    'string',
                ]
            );
        }
    }

    /**
     * @param string $inviteId
     * @return Invitation | null
     */
    public function getInvitation(string $inviteId)
    {
        $invite = $this->connection->fetchAssoc(
            'SELECT 
                id,
                invitation_id,
                owner_id,
                site_id,
                role,
                site_role,
                expires,
                created_at,
                uses_left,
                message
             FROM user_invitations
             WHERE invitation_id = ?
            ',
            [$inviteId]
        );

        if (!$invite) {
            return null;
        }

        return $this->mapInvitationRow($invite);
    }

    public function deleteInvitation(string $inviteId)
    {
        $this->connection->delete('user_invitations', ['invitation_id' => $inviteId], ['string']);
    }

}

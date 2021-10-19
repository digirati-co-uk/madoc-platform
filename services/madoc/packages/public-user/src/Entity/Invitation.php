<?php

namespace PublicUser\Entity;

use DateTime;

class Invitation
{
    public $id;
    public $invitationId;
    public $ownerId;
    public $siteId;
    public $role;
    public $expires;
    public $createdAt;
    public $usesLeft;
    public $message;
    public $siteRole;

    public function __construct(
        int $id,
        string $invitationId,
        int $ownerId,
        int $siteId,
        string $role,
        string $siteRole,
        DateTime $expires,
        DateTime $createdAt,
        int $usesLeft,
        string $message = ''
    ) {
        $this->id = $id;
        $this->invitationId = $invitationId;
        $this->ownerId = $ownerId;
        $this->siteId = $siteId;
        $this->role = $role;
        $this->expires = $expires;
        $this->createdAt = $createdAt;
        $this->usesLeft = $usesLeft;

        if (trim($message[0]) === '{') {
            try {
                $_message = json_decode($message, true);
                $message = $_message['en'][0] ?: '';
            } catch (\Throwable $err) {
                var_dump((string)$err);
                $message = '';
            }
        }

        $this->message = $message;
        $this->siteRole = $siteRole;
    }
}

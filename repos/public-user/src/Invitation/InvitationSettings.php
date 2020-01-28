<?php

namespace PublicUser\Invitation;

class InvitationSettings
{
    private $defaultExpiryTime;
    private $maxUses;
    private $defaultRole;
    private $defaultSiteRole;
    private $inviteTokenLength;

    public function __construct(
        int $defaultExpiryTime,
        int $maxUses,
        string $defaultRole,
        string $defaultSiteRole,
        int $inviteTokenLength
    ) {
        $this->defaultExpiryTime = $defaultExpiryTime;
        $this->maxUses = $maxUses;
        $this->defaultRole = $defaultRole;
        $this->inviteTokenLength = $inviteTokenLength;
        $this->defaultSiteRole = $defaultSiteRole;
    }

    public function getDefaultRole(): string
    {
        return $this->defaultRole;
    }

    public function getMaxUses(): int
    {
        return $this->maxUses;
    }

    public function getDefaultExpiryTime(): int
    {
        return $this->defaultExpiryTime;
    }

    public function getInviteTokenLength(): int
    {
        return $this->inviteTokenLength;
    }

    public function getDefaultSiteRole(): string
    {
        return $this->defaultSiteRole;
    }
}

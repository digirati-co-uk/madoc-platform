<?php

namespace PublicUser\Settings;

use Digirati\OmekaShared\Helper\SettingsHelper;
use Omeka\Settings\Settings;

/**
 * A read-only wrapper around settings for the {@code PublicUser} user registration module.
 */
class PublicUserSettings
{
    const ENABLE_REGISTRATION = 'public-user-enable-registration';
    const ACTIVATION_AUTOMATIC = 'public-user-automatic-activation';
    const LOGIN_REDIRECT = 'public-user-login-redirect';
    const DEFAULT_NEW_ROLE = 'public-user-registration-role';
    const INVITE_ONLY = 'public-user-invite-only';

    const ADDITIONAL_ROLES = [
        // Original Omeka roles
        'viewer' => 'Viewer',
        'editor' => 'Editor',
        'admin' => 'Admin',
        // Can transcribe tasks assigned to them.
        'limited-transcriber' => 'Limited Transcriber',
        // Can transcribe and review tasks assigned to them.
        'limited-reviewer' => 'Limited Reviewer',
        // Can transcribe anything
        'transcriber' => 'Transcriber',
        // Can transcribe and review anything.
        'reviewer' => 'Reviewer',
    ];

    const GLOBAL_SETTING_SCOPE = '__global__';
    private $settings;
    private $currentSiteSettings;

    public function __construct(
        Settings $settings,
        SettingsHelper $currentSiteSettings
    ) {
        $this->settings = $settings;
        $this->currentSiteSettings = $currentSiteSettings;
    }

    const APPLY_CUSTOM_SITE_PERMISSION_TO_ROLES = [
        'viewer',
        'limited-transcriber',
        'limited-reviewer',
        'transcriber',
    ];

    const CUSTOM_SITE_PERMISSIONS = [
        'view-canvas',
        'view-manifest',
        'view-collection',
        'view-all-collections',
    ];

    public function canUserWithRole(string $role, string $perm)
    {
        if (
            !in_array($role, self::APPLY_CUSTOM_SITE_PERMISSION_TO_ROLES) ||
            !in_array($perm, self::CUSTOM_SITE_PERMISSIONS)
        ) {
            return false;
        }

        return (bool)$this->currentSiteSettings->get("public-user-site-permissions-$role-$perm", true);
    }

    /**
     * @param string $email
     *
     * @return bool
     */
    public function isEmailBlacklisted(string $email)
    {
        $blacklistString = $this->globalSetting('email_blacklist');
        $blacklist = array_map('strtolower', array_map('trim', explode("\n", $blacklistString))) ?? [];
        $emailDomain = array_reverse(explode('@', $email))[0];

        return in_array(strtolower($emailDomain), $blacklist);
    }

    public function getInviteOnlyStatus()
    {
        return boolval($this->currentSiteSettings->get(self::INVITE_ONLY, false));
    }

    public function getActivationEmailTemplate()
    {
        return [
            'subject' => $this->globalSetting('user_activation_subject'),
            'copy' => $this->globalSetting('user_activation_copy'),
        ];
    }

    public function getPasswordResetEmailTemplate()
    {
        return [
            'subject' => $this->globalSetting('user_reset_password_subject'),
            'copy' => $this->globalSetting('user_activation_copy'),
        ];
    }

    /**
     * Check if registration is permitted by the given {@link Site}.
     *
     * @return bool
     */
    public function isRegistrationPermitted()
    {
        return (bool)$this->currentSiteSettings->get(self::ENABLE_REGISTRATION);
    }

    /**
     * Check if newly registered users should be activated automatically and allowed
     * to start interacting with the {@link Site}.
     *
     * @return bool
     */
    public function isActivationAutomatic()
    {
        return (bool)$this->currentSiteSettings->get(self::ACTIVATION_AUTOMATIC);
    }

    /**
     * Get the default role associated with new users signing up to the given {@link Site}.
     *
     * @return string
     */
    public function getDefaultUserRole()
    {
        $role = (string)$this->currentSiteSettings->get(self::DEFAULT_NEW_ROLE, 'Transcriber');

        if ($role !== 'Transcriber') {
            error_log('Warning: One of your sites is configured to give users permissions on this Madoc site.');
        }

        return 'Transcriber';
    }

    public function isUserProfilesEnabled(): bool
    {
        return (bool)$this->globalSetting('user_profiles_enabled');
    }

    public function getUserLoginRedirect()
    {
        return $this->currentSiteSettings->get(self::LOGIN_REDIRECT);
    }

    public function getUserProfilesResourceTemplate(): int
    {
        return (int)$this->globalSetting('user_profiles_resource_template');
    }

    private function globalSetting(string $settingName)
    {
        $publicUserSettings = $this->settings->get('publicuser');

        if (!isset($publicUserSettings[self::GLOBAL_SETTING_SCOPE])) {
            return null;
        }

        return $publicUserSettings[self::GLOBAL_SETTING_SCOPE][$settingName];
    }
}

<?php

namespace PublicUser\Settings;

use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\Site;
use Omeka\Settings\Settings;

/**
 * A read-only wrapper around settings for the {@code PublicUser} user registration module.
 */
class PublicUserSettings
{
    const REGISTRATION_ALLOWED = 'user_register';
    const DEFAULT_NEW_TO_ACTIVE = 'user_active';
    const DEFAULT_NEW_ROLE = 'user_role';

    const GLOBAL_SETTING_SCOPE = '__global__';
    private $settings;

    public function __construct(Settings $settings)
    {
        $this->settings = $settings;
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
     * @param SiteRepresentation $site
     *
     * @return bool
     */
    public function isRegistrationPermitted(SiteRepresentation $site)
    {
        return (bool) $this->siteSetting($site, self::REGISTRATION_ALLOWED);
    }

    private function siteSetting(SiteRepresentation $site, string $settingName)
    {
        $siteSlug = $site->slug();
        $publicUserSettings = $this->settings->get('publicuser');

        if (!isset($publicUserSettings[$siteSlug])) {
            return null;
        }

        return $publicUserSettings[$siteSlug]["${siteSlug}_${settingName}"];
    }

    /**
     * Check if newly registered users should be activated automatically and allowed
     * to start interacting with the {@link Site}.
     *
     * @param SiteRepresentation $site
     *
     * @return bool
     */
    public function isActivationAutomatic(SiteRepresentation $site)
    {
        return (bool) $this->siteSetting($site, self::DEFAULT_NEW_TO_ACTIVE);
    }

    /**
     * Get the default role associated with new users signing up to the given {@link Site}.
     *
     * @param SiteRepresentation $site
     *
     * @return string
     */
    public function getDefaultUserRole(SiteRepresentation $site)
    {
        return (string) $this->siteSetting($site, self::DEFAULT_NEW_ROLE);
    }

    public function isUserProfilesEnabled(): bool
    {
        return (bool) $this->globalSetting('user_profiles_enabled');
    }

    private function globalSetting(string $settingName)
    {
        $publicUserSettings = $this->settings->get('publicuser');

        if (!isset($publicUserSettings[self::GLOBAL_SETTING_SCOPE])) {
            return null;
        }

        return $publicUserSettings[self::GLOBAL_SETTING_SCOPE][$settingName];
    }

    public function getUserLoginRedirect(SiteRepresentation $site)
    {
        return $this->siteSetting($site, 'redirect');
    }

    public function getUserProfilesResourceTemplate(): int
    {
        return (int) $this->globalSetting('user_profiles_resource_template');
    }
}

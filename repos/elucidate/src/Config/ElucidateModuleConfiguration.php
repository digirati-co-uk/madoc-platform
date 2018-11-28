<?php

namespace ElucidateModule\Config;

/**
 * A configuration container for all things related to Elucidate.
 */
final class ElucidateModuleConfiguration
{
    const STATUS_UNAPPROVED = 'unapproved';
    const STATUS_APPROVED = 'approved';

    const RESOURCE_ANNOTATIONS = 'annotations';
    const RESOURCE_IIIF = 'iiif';

    /**
     * @var array
     */
    private $configuration;

    public function __construct($configuration)
    {
        $this->configuration = $configuration;
    }

    /**
     * Check if moderation is enabled for the given resource.
     *
     * @param string $resource
     *
     * @return bool
     */
    public function isResourceModerationEnabled(string $resource)
    {
        return in_array($resource, $this->configuration['moderation']['enabled_resources'] ?? [], true);
    }

    /**
     * Returns whether a {@code flagged} resource should be redacted immediately upon sending a message to Winston
     * for an item that is already visible.
     *
     * @param string $type
     *
     * @return bool
     */
    public function isRedactionImmediate(string $type): bool
    {
        return self::STATUS_APPROVED === $this->getDefaultModerationStatus($type)
            && $this->configuration['moderation']['redact_immediately'];
    }

    /**
     * Check whether {@code type}s of items should be approved or unapproved by default.
     *
     * @param string $type
     *
     * @return string
     */
    public function getDefaultModerationStatus(string $type): string
    {
        return $this->configuration['moderation']['default_status'][$type]
            ?? self::STATUS_UNAPPROVED;
    }
}

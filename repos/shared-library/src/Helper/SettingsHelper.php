<?php

namespace Digirati\OmekaShared\Helper;

use Omeka\View\Helper\Setting;
use Throwable;

class SettingsHelper extends Setting
{
    /**
     * Get a setting
     *
     * Will return null if no setting exists with the passed ID.
     *
     * @param string $id
     * @param mixed $default
     * @param int $targetId
     * @return mixed
     */
    public function __invoke($id, $default = null, $targetId = null)
    {
        try {
            return parent::__invoke($id, $default, $targetId);
        } catch (Throwable $e) {
            return $default;
        }
    }

    public function get($id, $default = null, $targetId = null)
    {
        return $this->__invoke($id, $default, $targetId);
    }

}

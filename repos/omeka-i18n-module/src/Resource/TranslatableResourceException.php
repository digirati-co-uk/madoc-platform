<?php

namespace i18n\Resource;

use Exception;
use Throwable;

class TranslatableResourceException extends Exception
{
    /**
     * @var string
     */
    private $msg;
    /**
     * @var Throwable
     */
    private $prev;

    public function __construct(string $msg, Throwable $prev = null)
    {
        parent::__construct($msg, 0, $prev);

        $this->msg = $msg;
        $this->prev = $prev;
    }
}

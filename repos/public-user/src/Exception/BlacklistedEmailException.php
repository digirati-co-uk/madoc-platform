<?php

namespace PublicUser\Exception;

use Throwable;
use UnexpectedValueException;

class BlacklistedEmailException extends UnexpectedValueException
{
    public function __construct(int $code = 0, Throwable $previous = null)
    {
        parent::__construct('Email provided is blacklisted', $code, $previous);
    }
}

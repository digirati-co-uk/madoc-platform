<?php

namespace ElucidateModule\ViewModel;

use ArrayAccess as ArrayAccessInterface;
use Elucidate\Model\ArrayAccess;

final class OmekaLink implements ArrayAccessInterface
{
    use ArrayAccess;

    private $label;
    private $omekaUri;

    public function __construct(string $label, string $omekaUri = null)
    {
        $this->label = $label;
        $this->omekaUri = $omekaUri;
    }
}

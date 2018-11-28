<?php

namespace ElucidateModule\ViewModel;

use ArrayAccess as ArrayAccessInterface;
use Elucidate\Model\ArrayAccess;

class OmekaSource implements ArrayAccessInterface
{
    use ArrayAccess;

    private $id;
    private $type;

    public function __construct(string $id, string $type)
    {
        $this->id = $id;
        $this->type = $type;
    }
}

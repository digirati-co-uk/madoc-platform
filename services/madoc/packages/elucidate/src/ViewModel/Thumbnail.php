<?php

namespace ElucidateModule\ViewModel;

use ArrayAccess as ArrayAccessInterface;
use Elucidate\Model\ArrayAccess;

final class Thumbnail implements ArrayAccessInterface
{
    use ArrayAccess;

    private $region;
    private $full;
    private $smallThumbnail;
    private $largeThumbnail;
    private $mediumThumbnail;

    public function __construct(
        string $region = null,
        string $full = null,
        string $smallThumbnail = null,
        string $mediumThumbnail = null,
        string $largeThumbnail = null
    ) {
        $this->region = $region;
        $this->full = $mediumThumbnail;
        $this->smallThumbnail = $smallThumbnail;
        $this->mediumThumbnail = $mediumThumbnail;
        $this->largeThumbnail = $largeThumbnail;
    }
}

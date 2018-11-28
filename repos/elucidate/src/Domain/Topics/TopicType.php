<?php

namespace ElucidateModule\Domain\Topics;

final class TopicType
{
    /**
     * @var string
     */
    private $label;
    /**
     * @var string[]
     */
    private $classes;
    /**
     * @var bool
     */
    private $showInList;

    public function __construct(string $label, bool $showInList, string ...$classes)
    {
        $this->label = $label;
        $this->classes = $classes;
        $this->showInList = $showInList;
    }

    public function showInList()
    {
        return $this->showInList;
    }

    public function getLabel()
    {
        return $this->label;
    }

    public function getClasses()
    {
        return $this->classes;
    }

    public function represents($type): bool
    {
        $shortType = explode(':', $type);

        return in_array(strtolower(array_reverse($shortType)[0]), $this->classes);
    }
}

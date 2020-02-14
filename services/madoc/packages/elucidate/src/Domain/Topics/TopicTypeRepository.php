<?php

namespace ElucidateModule\Domain\Topics;

/**
 * Simple in-memory repository that provides {@link TopicType}s.
 */
final class TopicTypeRepository
{
    /**
     * @var array|TopicType[]
     */
    private $types;

    public function __construct(TopicType ...$types)
    {
        $this->types = $types;
    }

    public function findAll()
    {
        return $this->types;
    }

    public function findAllInList()
    {
        return array_filter($this->types, function (TopicType $type) {
            return $type->showInList();
        });
    }

    /**
     * @param string $class
     *
     * @return TopicType|null
     *
     * @throws \Exception
     */
    public function findOneByClass(string $class)
    {
        $items = array_filter($this->types, function (TopicType $type) use ($class) {
            return $type->represents($class);
        });

        $foundItems = count($items);
        if (0 == $foundItems) {
            return null;
        } elseif (1 == $foundItems) {
            return array_shift($items);
        } else {
            throw new \Exception('Found more than one match for unique topic type name');
        }
    }

    public function findOneByName(string $name)
    {
        $items = array_filter($this->types, function (TopicType $type) use ($name) {
            return $type->getLabel() === $name;
        });

        $foundItems = count($items);
        if (0 == $foundItems) {
            return null;
        } elseif (1 == $foundItems) {
            return array_shift($items);
        } else {
            throw new \Exception('Found more than one match for unique topic type name');
        }
    }
}

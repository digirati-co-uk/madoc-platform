<?php

namespace CaptureModelImport\Model;

class ResourcePropertyAdapter
{
    private $id;
    private $label;
    private $type;
    private $comment;
    private $vocabulary;
    private $term;

    /**
     * ResourceProperty constructor.
     *
     * @param $label
     * @param string $type
     * @param $owner
     * @param $resourceClass
     */
    public function __construct($id, $label, $type, $comment, $vocabulary, $term)
    {
        $this->id = $id;
        $this->label = $label;
        $this->type = $type;
        $this->comment = $comment;
        $this->vocabulary = $vocabulary;
        $this->term = $term;
    }

    public function toJsonLd()
    {
        return [
      '@id' => $this->id,
      'o:label' => $this->label,
      '@type' => $this->type,
      'o:comment' => $this->comment,
      'o:vocabulary' => $this->vocabulary,
      'o:term' => $this->term,
    ];
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @param string $type
     */
    public function setType(string $type)
    {
        $this->type = $type;
    }

    /**
     * @return mixed
     */
    public function getOwner()
    {
        return $this->owner;
    }

    /**
     * @param mixed $owner
     */
    public function setOwner($owner)
    {
        $this->owner = $owner;
    }

    /**
     * @return mixed
     */
    public function getResourceClass()
    {
        return $this->resourceClass;
    }

    /**
     * @param mixed $resourceClass
     */
    public function setResourceClass($resourceClass)
    {
        $this->resourceClass = $resourceClass;
    }

    /**
     * @return mixed
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @param mixed $label
     */
    public function setLabel($label)
    {
        $this->label = $label;
    }
}

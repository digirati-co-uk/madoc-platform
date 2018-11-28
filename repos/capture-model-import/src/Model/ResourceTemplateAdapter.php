<?php

namespace CaptureModelImport\Model;

class ResourceTemplateAdapter
{
    private $label;
    private $type = '';
    private $owner;
    private $resourceClass;
    private $properties;

    /**
     * ResourceTemplateAdapter constructor.
     *
     * @param $label
     * @param string $type
     * @param $owner
     * @param $resourceClass
     * @param $properties
     */
    public function __construct($label, $type, $owner, $resourceClass, $properties = null)
    {
        $this->label = $label;
        $this->type = $type;
        $this->owner = $owner;
        $this->resourceClass = $resourceClass;
        $this->properties = [];
    }

    public function toJsonLd()
    {
        return [
      'o:label' => $this->label,
      '@type' => 'o:Property',
      'o:owner' => $this->owner,
      'o:resource_class' => $this->resourceClass,
      'o:resource_template_property' => $this->getPropertiesJson(),
    ];
    }

    private function getPropertiesJson()
    {
        $ret = [];

        foreach ($this->properties as $property) {
            array_push($ret, $property->toJsonLd());
        }

        return $ret;
    }

    public function addProperty(ResourcePropertyAdapter $property)
    {
        array_push($this->properties, $property);
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
    public function getProperties()
    {
        return $this->properties;
    }

    /**
     * @param mixed $properties
     */
    public function setProperties($properties)
    {
        $this->properties = $properties;
    }
}

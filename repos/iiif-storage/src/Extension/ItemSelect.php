<?php


namespace IIIFStorage\Extension;


use Omeka\Form\Element\AbstractGroupByOwnerSelect;
use Zend\Form\ElementInterface;

class ItemSelect extends AbstractGroupByOwnerSelect implements ElementInterface
{

    /**
     * Get the resource name.
     *
     * @return string
     */
    public function getResourceName()
    {
        return 'items';
    }

    /**
     * Get the value label from a resource.
     *
     * @param $resource
     * @return string
     */
    public function getValueLabel($resource)
    {
        return $resource->displayTitle();
    }
}
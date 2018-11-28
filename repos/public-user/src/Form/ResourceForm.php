<?php

namespace PublicUser\Form;

use Assert\Assertion;
use Omeka\Api\Representation\ResourceTemplatePropertyRepresentation;
use Omeka\Api\Representation\ResourceTemplateRepresentation;
use Zend\EventManager\EventManagerAwareTrait;
use Zend\Form\Element\Hidden;
use Zend\Form\Element\Text;
use Zend\Form\Fieldset;
use Zend\Form\Form;

class ResourceForm extends Form
{
    use EventManagerAwareTrait;

    private static $defaultOptions = [
        'resource_template' => null,
        'read_only_properties' => [],
    ];

    /**
     * @throws \Assert\AssertionFailedException
     */
    public function init()
    {
        $options = array_merge(self::$defaultOptions, $this->options);

        /* @var ResourceTemplateRepresentation $template */
        Assertion::isInstanceOf($options['resource_template'], ResourceTemplateRepresentation::class);

        $template = $options['resource_template'];
        $readOnlyProperties = $options['read_only_properties'] ?? [];
        $templateProperties = $template->resourceTemplateProperties();

        array_walk($templateProperties,
            function (ResourceTemplatePropertyRepresentation $propertyTemplate) use ($readOnlyProperties) {
                $property = $propertyTemplate->property();
                $term = $property->term();
                if (in_array($term, $readOnlyProperties)) {
                    return;
                }

                $propertyFieldSet = new Fieldset($term);
                $propertyFieldSet->add($propertyInstanceFieldSet = new FieldSet('0'));

                $propertyId = new Hidden('property_id');
                $propertyId->setValue($property->id());

                $propertyType = new Hidden('type');
                $propertyType->setValue('literal');

                $propertyValue = new Text('@value');
                $propertyValue->setLabel($propertyTemplate->alternateLabel() ?: $property->label());
                $propertyValue->setOption('info', $propertyTemplate->alternateComment() ?: $property->comment());
                $propertyValue->setAttribute('required', $propertyTemplate->isRequired());

                $propertyInstanceFieldSet->add($propertyId);
                $propertyInstanceFieldSet->add($propertyType);
                $propertyInstanceFieldSet->add($propertyValue);

                $this->add($propertyFieldSet);
            }
        );
    }
}

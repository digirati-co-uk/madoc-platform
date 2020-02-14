<?php

namespace AnnotationStudio\Components;

use Zend\Uri\Uri;

trait WithVariations
{
    public function withCustomVariation($field, $value)
    {
        $url = new Uri($this->attributes['resource-templates']);
        $existingQuery = $url->getQueryAsArray();
        $url->setQuery(array_merge(
            $existingQuery,
            [$field => $value]
        ));
        $this->attributes['resource-templates'] = $url->toString();

        return $this;
    }

    public function withVariation($value)
    {
        return $this->withCustomVariation('rdfs:label', $value);
    }
}

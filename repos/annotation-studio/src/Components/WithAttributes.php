<?php

namespace AnnotationStudio\Components;

trait WithAttributes
{
    protected $attributes = [];
    protected $htmlAttributes = [];

    abstract public function getBehaviour();

    public function withAttributes($attributes)
    {
        $newThis = clone $this;
        $newThis->attributes = array_merge($this->attributes, $attributes);

        return $newThis;
    }

    public function __invoke($attributes)
    {
        $newThis = clone $this;
        $newThis->attributes = array_merge($this->attributes, $attributes);

        return $newThis->__toString();
    }

    public function attributeName($name) {
        return strtolower(preg_replace(['/([a-z\d])([A-Z])/', '/([^-])([A-Z][a-z])/'], '$1-$2', $name));
    }

    public function castValue($value) {
        if ($value === true) {
            return 'true';
        }
        if ($value === false) {
            return false;
        }
        return (string) $value;
    }

    public function __toString()
    {
        $html = [];
        if (!isset($this->attributes['behaviour'])) {
            $html[] = 'data-behaviour="'.$this->getBehaviour().'"';
        }
        foreach ($this->attributes as $attribute => $value) {
            $html[] = 'data-'.$this->attributeName($attribute).'="'.$this->castValue($value).'"';
        }
        foreach ($this->htmlAttributes as $attribute => $value) {
            $html[] = $attribute.'="'.$value.'""';
        }

        return implode(' ', $html);
    }
}

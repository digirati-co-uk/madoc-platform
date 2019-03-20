<?php

namespace Digirati\OmekaShared\Model;

class ItemRequest
{

    /**
     * @var int
     */
    private $id;
    /**
     * @var string
     */
    private $resourceTemplate;
    /**
     * @var string
     */
    private $resourceClass;
    /**
     * @var FieldValue[][]
     */
    private $fields;
    /**
     * @var array
     */
    private $source;
    /**
     * @var string
     */
    private $resourceTemplateName;
    /**
     * @var string
     */
    private $resourceClassName;

    /**
     * @var MediaValue[]
     */
    private $media = [];


    public function __construct(
        ?int $id,
        ?int $resourceTemplate,
        ?int $resourceClass,
        array $fields = [],
        array $source = []
    ) {
        $this->id = $id;
        $this->resourceTemplate = $resourceTemplate;
        $this->resourceClass = $resourceClass;
        $this->fields = $fields;
        $this->source = $source;
    }

    public static function fromScratch(): ItemRequest
    {
        return new static(null, null, null, [], []);
    }

    public static function fromSource($source): ItemRequest
    {
        return new static($source['o:id'], null, null, [], $source);
    }


    /**
     * @param array $data
     * @return ItemRequest
     */
    public static function fromPost(array $data): ItemRequest
    {
        return new static(
            $data['o:id'] ?? null,
            (int) $data['o:resource_template']['o:id'] ?? null,
            (int) $data['o:resource_class']['o:id'] ?? null,
            array_reduce(array_keys($data), function ($acc, $key) use ($data) {
                if (
                    strpos($key, ':') !== -1 &&
                    strpos($key, 'o:') !== 0 &&
                    strpos($key, '@') !== 0 &&
                    is_array($data[$key])
                ) {
                    $acc[$key] = array_map(function ($item) use ($key) {
                        return FieldValue::fromPost($key, $item);
                    }, $data[$key]);
                }
                return $acc;
            }, []),
            $data
        );
    }

    /**
     * @return array
     */
    public function export(): array
    {
        $data = [];
        if ($this->id) {
            $data['o:id'] = $this->id;
        }
        if ($this->resourceClass) {
            $data['o:resource_class'] = [
                'o:id' => $this->resourceClass
            ];
        }
        if ($this->resourceTemplate) {
            $data['o:resource_template'] = [
                'o:id' => $this->resourceTemplate
            ];
        }

        $data = array_reduce(array_keys($this->fields), function ($acc, $key) {
            $field = $this->fields[$key];
            if ($field) {
                $acc[$key] = array_filter(
                    array_map(function (FieldValue $value) {
                        return $value->export();
                    }, $field)
                );
            }
            return $acc;
        }, $data);

        if ($this->media) {
            $data['o:media'] = $data['o:media'] ?? [];
            foreach ($this->media as $value) {
                $data['o:media'][] = $value->export();
        }
        }

        foreach ($this->source as $key => $value) {
            if (!isset($data[$key])) {
                $data[$key] = $value;
            }
        }
        return $data;
    }

    /**
     * @param string $term
     * @return bool
     */
    public function hasField(string $term): bool
    {
        return isset($this->fields[$term]);
    }

    /**
     * @param string $term
     */
    public function removeField(string $term)
    {
        if ($this->hasField($term)) {
            $this->fields[$term] = null;
            unset($this->fields[$term]);
        }
    }

    /**
     * @param callable $func
     */
    public function eachFieldValues(callable $func)
    {
        foreach ($this->fields as $fields) {
            foreach ($fields as $field) {
                if ($field instanceof FieldValue) {
                    $func($field);
                }
                if ($field instanceof MediaValue) {
                    foreach ($field->getFields() as $innerField) {
                        $func($innerField);
                    }
                }
            }
        }
    }

    /**
     * @param ValueInterface $value
     * @return ItemRequest
     */
    public function addField(ValueInterface $value): self
    {
        if ($value instanceof FieldValue) {
            $term = $value->getTerm();
            if (!$this->hasField($term)) {
                $this->fields[$term] = [];
            }
            $this->fields[$term][] = $value;
        }
        if ($value instanceof MediaValue) {
            $this->media[] = $value;
        }

        return $this;
    }

    /**
     * @return string
     */
    public function getResourceClassName(): string
    {
        return $this->resourceClassName ?? '';
    }

    /**
     * @param string $resourceClassName
     */
    public function setResourceClassName(string $resourceClassName): void
    {
        $this->resourceClassName = $resourceClassName;
    }

    /**
     * @return string
     */
    public function getResourceTemplateName(): string
    {
        return $this->resourceTemplateName ?? '';
    }

    /**
     * @param string $resourceTemplateName
     */
    public function setResourceTemplateName(string $resourceTemplateName): void
    {
        $this->resourceTemplateName = $resourceTemplateName;
    }

    /**
     * @return string
     */
    public function getResourceClass(): string
    {
        return $this->resourceClass ?? '';
    }

    /**
     * @return string
     */
    public function getResourceTemplate(): string
    {
        return $this->resourceTemplate ?? '';
    }

    public function getValue(string $term)
    {
        if (!$this->hasField($term)) return null;
        return $this->fields[$term];
    }

    public function overwriteSingleValue(FieldValue $value): self
    {
        $term = $value->getTerm();
        if (!$this->hasField($term)) return $this;
        $this->fields[$term] = [$value];
        return $this;
    }

    public function overwriteValue(array $values): self
    {
        $term = null;
        foreach ($values as $value) {
            if (!$value instanceof FieldValue) {
                throw new \InvalidArgumentException('$values must be of type ValueInterface[]');
            }
            if (!$term) {
                $term = $value->getTerm();
            } else if ($term !==  $value->getTerm()) {
                throw new \InvalidArgumentException('$values must have the same term');
            }
        }
        if (!$this->hasField($term)) return $this;
        $this->fields[$term] = $values;
        return $this;
    }

    /**
     * @param string $resourceClass
     */
    public function setResourceClass(string $resourceClass): void
    {
        $this->resourceClass = $resourceClass;
    }

    /**
     * @param string $resourceTemplate
     */
    public function setResourceTemplate(string $resourceTemplate): void
    {
        $this->resourceTemplate = $resourceTemplate;
    }

}

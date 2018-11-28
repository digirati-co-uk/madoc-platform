<?php

namespace ElucidateModule\Domain;

use ElucidateModule\ViewModel\Annotation;

class SortableAnnotationList
{
    public function __construct($annotations)
    {
        $this->annotations = array_filter($annotations ?? []);
    }

    protected $annotations = [];

    public function debugChangeUrl($from, $to)
    {
        return new static(
            array_map(function ($annotation) use ($from, $to) {
                return $annotation->withNewSourceId(
                    str_replace($from, $to, $annotation['source']['id'])
                );
            }, $this->annotations)
        );
    }

    private function devirtualiseTopic($topic)
    {
        return (strpos('virtual', $topic)) ?
            (str_replace('virtual', 'entity', $topic)) :
            $topic;
    }

    public function onlyType($type)
    {
        return new static(
            is_array($type) ?
                array_filter($this->annotations, function ($annotation) use ($type) {
                    $types = array_filter($type, 'strtolower');
                    $typeToSearch = $this->devirtualiseTopic($annotation['source']['type']);

                    return in_array(strtolower($typeToSearch), $types);
                }) :
                array_filter($this->annotations, function ($annotation) use ($type) {
                    $typeToSearch = $this->devirtualiseTopic($annotation['source']['type']);

                    return strtolower($type) === strtolower($typeToSearch);
                })
        );
    }

    public function orderByLabel()
    {
        $annotations = array_merge([], $this->annotations);
        usort($annotations, function ($annotationA, $annotationB) {
            return strcmp($annotationA['label'], $annotationB['label']);
        });

        return new static(
            $annotations
        );
    }

    public function groupByCanvas()
    {
        $canvases = [];
        $newList = [];

        foreach ($this->annotations as $annotation) {
            $canvas = $annotation['canvasSource']['omekaUri'];
            $canvases[$canvas][] = $annotation;
        }
        foreach ($canvases as $annotations) {
            /** @var Annotation $first */
            $first = current($annotations);
            $newList[] = $first->withThumbnails(
                array_map(function ($annotation) {
                    return $annotation['thumbnail'];
                }, $annotations)
            );
        }

        return new static($newList);
    }

    public function onlyCanvas(string $omekaUri = null): SortableAnnotationList
    {
        if (null === $omekaUri) {
            return new SortableAnnotationList([]);
        }
        $list = [];
        foreach ($this->annotations as $annotation) {
            if ($omekaUri === $annotation['canvasSource']['omekaUri']) {
                $list[] = $annotation;
            }
        }

        return new SortableAnnotationList($list);
    }

    public function deduplicateByManifest()
    {
        $newList = [];
        foreach ($this->annotations as $annotation) {
            /* @var $annotation Annotation */
            $newList[$annotation['manifestSource']['omekaUri']] = $annotation;
        }

        return new static(array_values($newList));
    }

    public function deduplicateBySource()
    {
        $newList = [];
        foreach ($this->annotations as $annotation) {
            /* @var $annotation Annotation */
            $newList[$annotation['source']['id']] = $annotation;
        }

        return new static(array_values($newList));
    }

    public function onlyMotivations($motivationToShow)
    {
        return new static(
            array_filter($this->annotations, function ($annotation) use ($motivationToShow) {
                $motivation = is_string($annotation['motivation']) ? $annotation['motivation'] : $annotation['motivation']['label'];

                return strtolower($motivation) === strtolower($motivationToShow);
            })
        );
    }

    public function withoutMotivations($motivationToHide)
    {
        return new static(
            array_filter(
                $this->annotations,
                function ($annotation) use ($motivationToHide) {
                    $motivation = is_string($annotation['motivation']) ? $annotation['motivation'] : $annotation['motivation']['label'];

                    return strtolower($motivation) !== strtolower($motivationToHide);
                }
            )
        );
    }

    /**
     * @deprecated
     */
    public function deduplicate()
    {
        $this->deduplicateBySource();
    }

    public function getOne()
    {
        return current($this->annotations);
    }

    /**
     * @return Annotation[]
     */
    public function get()
    {
        return $this->annotations;
    }
}

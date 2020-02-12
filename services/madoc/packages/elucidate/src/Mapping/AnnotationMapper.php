<?php

namespace ElucidateModule\Mapping;

use Elucidate\Model\Annotation;

class AnnotationMapper
{
    private $generator;
    private $bodyType;

    public function __construct(
        string $generator,
        string $bodyType
    ) {
        $this->generator = $generator;
        $this->bodyType = $bodyType;
    }

    public function getSerializedBodiesFromAnnotation(Annotation $annotation)
    {
        if (!isset($annotation['body'])) {
            return null;
        }
        $bodies = isset($annotation['body']['type']) ? [$annotation['body']] : $annotation['body'];

        return array_reduce($bodies, function ($state, $body) {
            $type = $body['type'] ?? 'unknown';
            $types = is_array($type) ? $type : [$type];
            if (in_array($this->bodyType, $types)) {
                $state[] = json_decode($body['value'], true);
            }

            return $state;
        }, []);
    }

    public function combineBodies(array $bodies): array
    {
        return array_reduce($bodies, function ($combined, $body) {
            return array_merge_recursive($combined, $body);
        }, []);
    }

    public function extractGeneratorDetails(Annotation $annotation)
    {
        $generator = $annotation['generator'];
        if (!$generator) {
            return null;
        }
        if (is_string($generator)) {
            return [$generator];
        }
        if (isset($generator['id'])) {
            return [$generator['id']];
        }

        return array_map(function ($single) {
            return $single['id'];
        }, $generator);
    }

    public function findCaptureModelFromGenerators(array $generators)
    {
        foreach ($generators as $generator) {
            $pieces = explode('/', $generator);
            if (in_array($this->generator, $pieces)) {
                return $generator;
            }
        }

        return null;
    }

    public function findCaptureModelIdFromGenerators(array $generators)
    {
        foreach ($generators as $generator) {
            $pieces = explode('/', $generator);
            if (in_array($this->generator, $pieces)) {
                return array_pop($pieces);
            }
        }

        return null;
    }
}

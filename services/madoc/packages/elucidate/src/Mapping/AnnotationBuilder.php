<?php

namespace ElucidateModule\Mapping;

use Elucidate\Model\Annotation;

class AnnotationBuilder
{
    private $subject;
    private $container;
    private $motivation;
    private $body;
    private $partOf;

    public function withTag(string $uri, string $label = null)
    {
        $this->body = $this->body ? $this->body : [];
        array_push($this->body, [
            [
                'type' => 'SpecificResource',
                'purpose' => 'tagging',
                'source' => $uri,
            ],
        ]);
        if ($label) {
            array_push($this->body, [
                [
                    'type' => 'TextualBody',
                    'purpose' => 'tagging',
                    'value' => $label,
                ],
            ]);
        }

        return $this;
    }

    public function withTextualBody(string $body)
    {
        $this->body = $this->body ? $this->body : [];
        array_push($this->body, [
            [
                'type' => ['TextualBody'],
                'format' => 'text/plain',
                'value' => $body,
            ],
        ]);

        return $this;
    }

    public function withSubject(string $subject)
    {
        $this->subject = $subject;

        return $this;
    }

    public function withSubjectPartOf(string $partOf = null)
    {
        if ($partOf) {
            $this->partOf = $partOf;
        }

        return $this;
    }

    public function withContainer(string $container)
    {
        $this->container = $container;

        return $this;
    }

    public function withMotivation(string $motivation)
    {
        $this->motivation = $motivation;

        return $this;
    }

    public function build()
    {
        $subject = $this->partOf ? [
            'dcterms:isPartOf' => [
                'id' => $this->partOf,
            ],
            'source' => $this->subject,
            'type' => 'SpecificResource',
        ] : $this->subject;

        $annotation = new Annotation(null, $this->body, $subject);
        $annotation->addMetaData([
            'motivation' => $this->motivation,
        ]);

        $container = implode('/', array_slice(explode('/', $this->container), -2, 2));
        $annotation->withContainer($container);

        return $annotation;
    }
}

<?php

namespace ElucidateModule\Tests\Mapping;

use ElucidateModule\Mapping\AnnotationMapper;
use Elucidate\Model\Annotation;
use PHPUnit\Framework\TestCase;

class AnnotationMapperTest extends TestCase
{
    const SIMPLE_ANNOTATION = '{
      "id": "https:\/\/nlw-elucidate.digtest.co.uk\/annotation\/w3c\/9e2391c545618f375e6d8e1bd705c936\/7aa95e7f-1c07-4635-9002-78951eae4e9c",
      "type": "Annotation",
      "label": "unknown",
      "body": {
        "type": [
          "TextualBody",
          "Dataset"
        ],
        "format": "text\/plain",
        "value": "{\"@context\":{\"title\":\"dcterms:title\"},\"title\":\"test\"}"
      },
      "motivation": "tagging"
    }';

    const MULTI_BODY_ANNOTATION = '{
      "id": "https:\/\/nlw-elucidate.digtest.co.uk\/annotation\/w3c\/9e2391c545618f375e6d8e1bd705c936\/7aa95e7f-1c07-4635-9002-78951eae4e9c",
      "type": "Annotation",
      "label": "unknown",
      "body": [
        {
          "type": [
            "TextualBody",
            "Dataset"
          ],
          "format": "text\/plain",
          "value": "{\"@context\":{\"title\":\"dcterms:title\"},\"title\":\"test\"}"
        },
        {
          "type": [
            "TextualBody",
            "Dataset"
          ],
          "format": "text\/plain",
          "value": "{\"@context\":{\"foaf:name\":\"http:\/\/xmlns.com\/foaf\/name\",\"schema:birthDate\":\"https:\/\/schema.org\/birthDate\",\"jobTitle\":\"https:\/\/schema.org\/jobTitle\",\"Description\":\"http:\/\/dublincore.org\/documents\/dcmi-terms\/#terms-description\"},\"foaf:name\":\"test\",\"schema:birthDate\":\"2017-06-27T18:50:20.000Z\",\"jobTitle\":\"Web Developer\",\"Description\":\"51.5073509,-0.12775829999998223\"}"
        }
      ],
      "motivation": "tagging"
    }';

    const LARGE_ANNOTATION = '{
      "id": "https:\/\/nlw-elucidate.digtest.co.uk\/annotation\/w3c\/9e2391c545618f375e6d8e1bd705c936\/7aa95e7f-1c07-4635-9002-78951eae4e9c",
      "type": "Annotation",
      "label": "unknown",
      "body": [
        {
          "type": [
            "TextualBody",
            "Dataset"
          ],
          "format": "text\/plain",
          "value": "{\"@context\":{\"title\":\"dcterms:title\"},\"title\":\"test\"}"
        },
        {
          "type": "SpecificResource",
          "format": "application\/html",
          "purpose": "tagging",
          "source": "https:\/\/omeka.dlcs-ida.org\/s\/ida\/page\/topics\/tribe\/san+ildefonso"
        },
        {
          "type": "TextualBody",
          "format": "text\/plain",
          "purpose": "tagging",
          "value": "san ildefonso"
        },
        {
          "type": [
            "TextualBody",
            "Dataset"
          ],
          "format": "text\/plain",
          "value": "{\"@context\":{\"foaf:name\":\"http:\/\/xmlns.com\/foaf\/name\",\"schema:birthDate\":\"https:\/\/schema.org\/birthDate\",\"jobTitle\":\"https:\/\/schema.org\/jobTitle\",\"Description\":\"http:\/\/dublincore.org\/documents\/dcmi-terms\/#terms-description\"},\"foaf:name\":\"test\",\"schema:birthDate\":\"2017-06-27T18:50:20.000Z\",\"jobTitle\":\"Web Developer\",\"Description\":\"51.5073509,-0.12775829999998223\"}"
        }
      ],
      "motivation": "tagging"
    }';

    const VALID_NAMESPACE_ANNOTATION = '{
      "id": "https:\/\/nlw-elucidate.digtest.co.uk\/annotation\/w3c\/9e2391c545618f375e6d8e1bd705c936\/7aa95e7f-1c07-4635-9002-78951eae4e9c",
      "type": "Annotation",
      "label": "unknown",
      "body": [
        {
          "type": [
            "TextualBody",
            "Dataset"
          ],
          "format": "text\/plain",
          "value": "{\"@context\":{\"foaf:name\":\"http:\/\/xmlns.com\/foaf\/name\",\"schema:birthDate\":\"https:\/\/schema.org\/birthDate\",\"jobTitle\":\"https:\/\/schema.org\/jobTitle\",\"Description\":\"http:\/\/dublincore.org\/documents\/dcmi-terms\/#terms-description\"},\"foaf:name\":\"test\",\"schema:birthDate\":\"2017-06-27T18:50:20.000Z\",\"jobTitle\":\"Web Developer\",\"Description\":\"51.5073509,-0.12775829999998223\"}"
        }
      ],
      "motivation": "tagging"
    }';

    public function test_it_can_transform_encoded_bodies()
    {
        $annotation = Annotation::fromJson(static::SIMPLE_ANNOTATION);

        $importer = new AnnotationMapper('annotation-studio', 'Dataset');
        $bodies = $importer->getSerializedBodiesFromAnnotation($annotation);
        $this->assertEquals($bodies, [
            [
                '@context' => ['title' => 'dcterms:title'],
                'title' => 'test',
            ],
        ]);
    }

    public function test_it_can_combine_encoded_bodies()
    {
        $annotation = Annotation::fromJson(static::SIMPLE_ANNOTATION);

        $importer = new AnnotationMapper('annotation-studio', 'Dataset');
        $bodies = $importer->getSerializedBodiesFromAnnotation($annotation);
        $document = $importer->combineBodies($bodies);

        $this->assertEquals($document, [
            '@context' => ['title' => 'dcterms:title'],
            'title' => 'test',
        ]);
    }

    public function test_it_can_transform_multiple_encoded_bodies()
    {
        $annotation = Annotation::fromJson(static::MULTI_BODY_ANNOTATION);

        $importer = new AnnotationMapper('annotation-studio', 'Dataset');
        $bodies = $importer->getSerializedBodiesFromAnnotation($annotation);

        $this->assertEquals(
            $bodies,
            [
                [
                    '@context' => ['title' => 'dcterms:title'],
                    'title' => 'test',
                ],
                [
                    '@context' => [
                        'foaf:name' => 'http://xmlns.com/foaf/name',
                        'schema:birthDate' => 'https://schema.org/birthDate',
                        'jobTitle' => 'https://schema.org/jobTitle',
                        'Description' => 'http://dublincore.org/documents/dcmi-terms/#terms-description',
                    ],
                    'foaf:name' => 'test',
                    'schema:birthDate' => '2017-06-27T18:50:20.000Z',
                    'jobTitle' => 'Web Developer',
                    'Description' => '51.5073509,-0.12775829999998223',
                ],
            ]
        );
    }

    public function test_it_can_combine_multiple_encoded_bodies()
    {
        $annotation = Annotation::fromJson(static::MULTI_BODY_ANNOTATION);

        $importer = new AnnotationMapper('annotation-studio', 'Dataset');
        $bodies = $importer->getSerializedBodiesFromAnnotation($annotation);
        $document = $importer->combineBodies($bodies);

        $this->assertEquals($document, [
            '@context' => [
                'title' => 'dcterms:title',
                'foaf:name' => 'http://xmlns.com/foaf/name',
                'schema:birthDate' => 'https://schema.org/birthDate',
                'jobTitle' => 'https://schema.org/jobTitle',
                'Description' => 'http://dublincore.org/documents/dcmi-terms/#terms-description',
            ],
            'title' => 'test',
            'foaf:name' => 'test',
            'schema:birthDate' => '2017-06-27T18:50:20.000Z',
            'jobTitle' => 'Web Developer',
            'Description' => '51.5073509,-0.12775829999998223',
        ]);
    }

    public function test_it_ignores_other_bodies()
    {
        $annotation = Annotation::fromJson(static::LARGE_ANNOTATION);

        $importer = new AnnotationMapper('annotation-studio', 'Dataset');
        $bodies = $importer->getSerializedBodiesFromAnnotation($annotation);
        $document = $importer->combineBodies($bodies);

        $this->assertEquals($document, [
            '@context' => [
                'title' => 'dcterms:title',
                'foaf:name' => 'http://xmlns.com/foaf/name',
                'schema:birthDate' => 'https://schema.org/birthDate',
                'jobTitle' => 'https://schema.org/jobTitle',
                'Description' => 'http://dublincore.org/documents/dcmi-terms/#terms-description',
            ],
            'title' => 'test',
            'foaf:name' => 'test',
            'schema:birthDate' => '2017-06-27T18:50:20.000Z',
            'jobTitle' => 'Web Developer',
            'Description' => '51.5073509,-0.12775829999998223',
        ]);
    }
}

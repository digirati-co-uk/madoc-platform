<?php

namespace IIIFStorage\JsonBuilder;

use Digirati\OmekaShared\Utility\OmekaValue;
use LogicException;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

trait MetadataAggregator
{
    public function aggregateMetadata($representation, &$json)
    {
        if (!$representation instanceof ItemRepresentation && !$representation instanceof ItemSetRepresentation) {
            throw new LogicException('Items and ItemSets can be aggregated only.');
        }
        $mapping = $this->getFunctionalFields();
        $blacklist = $this->getBlacklist();

        foreach ($representation->values() as $key => $values) {
            if (in_array($key, $blacklist)) {
                continue;
            }
            /** @var ValueRepresentation $value */
            $mappingField = $mapping[$key] ?? null;
            if ($mappingField) {
                $json[$mappingField] = OmekaValue::toRdf($representation, $key);
            } else {
                // @todo Pass the labels through the translator in Omeka
                //       All of the field should be translated by Omeka and available
                //       to grab, this will work for templates, but a bug will occur in the
                //       virtual IIIF resources served by Omeka and they will not be translated
                //       by default.

                /** @var ValueRepresentation $first */
                $first = $values['values'][0];
                if ($first->type() === 'uri') {
                    $json['metadata'][] = [
                        'label' => $value->property()->label(),
                        'value' => $value->asHtml(),
                    ];
                }

                if ($first->type() === 'literal') {
                    $json['metadata'][] = [
                        'label' => OmekaValue::toRdf($representation, $key, true),
                        'value' => OmekaValue::toRdf($representation, $key, false),
                    ];
                }
            }
        }
        return $json;
    }

    abstract function getLang(): string;

    abstract function getFunctionalFields(): array;

    public function getBlacklist()
    {
        return [
            'dcterms:source',
            'dcterms:identifier',
            'exif:versionInfo'
        ];
    }

}

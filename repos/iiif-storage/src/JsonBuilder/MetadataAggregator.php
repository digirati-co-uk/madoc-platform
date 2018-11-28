<?php

namespace IIIFStorage\JsonBuilder;

use LogicException;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\ValueRepresentation;

trait MetadataAggregator
{
    public function aggregateMetadata($representation, &$json) {
        if (!$representation instanceof ItemRepresentation && !$representation instanceof ItemSetRepresentation) {
            throw new LogicException('Items and ItemSets can be aggregated only.');
        }
        $mapping = $this->getFunctionalFields();
        $blacklist = $this->getBlacklist();

        foreach ($representation->values() as $key => $value) {
            if (in_array($key, $blacklist)) {
                continue;
            }
            /** @var ValueRepresentation $value */
            $mappingField = $mapping[$key] ?? null;
            $value = $representation->value($key);
            if ($mappingField) {
                $json[$mappingField] = $value->value();
            } else {
                switch ($value->type()) {
                    case 'uri':
                        $json['metadata'][] = [
                            'label' => $value->property()->label(),
                            'value' => $value->asHtml(),
                        ];
                        break;
                    case 'literal':
                        $json['metadata'][] = [
                            'label' => $value->property()->label(),
                            'value' => $value->value(),
                        ];
                        break;
                    default:
                        break;
                }
            }
        }
        return $json;
    }

    abstract function getFunctionalFields(): array;

    public function getBlacklist() {
        return [
            'dcterms:source',
            'dcterms:identifier'
        ];
    }

}

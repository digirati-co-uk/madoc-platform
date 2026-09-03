import type { InternationalString } from '@iiif/presentation-3';
import type { FacetConfig } from '../../../shared/features/MetadataFacetEditor';
import { getTypesenseMetadataFacetFieldName } from '../../../../search/typesense/metadata-facet-field';

export interface TypesenseMetadataFacetValue {
  id: string;
  label: InternationalString;
  values: string[];
}

export interface TypesenseMetadataFacetField {
  attribute: string;
  values?: TypesenseMetadataFacetValue[];
}

export interface TypesenseMetadataFacet {
  id: string;
  label: InternationalString | string;
  fields: TypesenseMetadataFacetField[];
}

export interface DiscoveredTypesenseMetadataFacet {
  attribute: string;
  label: string;
}

function getConfiguredFieldName(key: string) {
  return getTypesenseMetadataFacetFieldName(key.replace(/^metadata\./i, ''));
}

export function resolveTypesenseMetadataFacets(
  discovered: DiscoveredTypesenseMetadataFacet[],
  configuration: FacetConfig[]
): TypesenseMetadataFacet[] {
  if (!configuration.length) {
    return discovered.map(facet => ({
      id: facet.attribute,
      label: facet.label,
      fields: [{ attribute: facet.attribute }],
    }));
  }

  const availableFields = new Set(discovered.map(facet => facet.attribute));

  return configuration
    .map(facet => {
      const fields = [...new Set(facet.keys.map(getConfiguredFieldName).filter((field): field is string => !!field))]
        .filter(field => availableFields.has(field))
        .map(attribute => {
          const values = facet.values
            ?.filter(value => getConfiguredFieldName(value.key) === attribute)
            .map(value => ({ id: value.id, label: value.label, values: value.values }));
          return { attribute, values };
        })
        .filter(field => !facet.values?.length || field.values?.length);

      return { id: facet.id, label: facet.label, fields };
    })
    .filter(facet => facet.fields.length);
}

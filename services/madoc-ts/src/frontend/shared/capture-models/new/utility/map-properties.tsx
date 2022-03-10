import React from 'react';
import { isEntityList } from '../../helpers/is-entity';
import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';
import { canInlineProperty } from './can-inline-property';

export function mapProperties(
  entity: CaptureModel['document'],
  render: (info: {
    label: string;
    property: string;
    canInlineField: boolean;
    description?: string;
    profile?: string;
    dataSources?: string[];
    hasSelector: boolean;
    type: 'entity' | 'field';
    instances: Array<BaseField | CaptureModel['document']>;
  }) => {}
) {
  const properties = Object.keys(entity.properties);

  return properties.map(property => {
    const instances = entity.properties[property];
    const singleEntity = instances[0];
    const label =
      instances.length > 1 && singleEntity.pluralLabel ? singleEntity.pluralLabel : singleEntity.label || 'Untitled';
    const isEntity = isEntityList(instances);
    const canInlineField = !isEntity && (canInlineProperty(instances) || !singleEntity.selector);
    const description = singleEntity.description;
    const profile = singleEntity.profile;
    const dataSources = singleEntity.dataSources;
    const hasSelector = !!instances[0]?.selector;

    return (
      <React.Fragment key={property}>
        {render({
          label,
          property,
          instances,
          canInlineField,
          description,
          profile,
          dataSources,
          hasSelector,
          type: isEntity ? 'entity' : 'field',
        })}
      </React.Fragment>
    );
  });
}

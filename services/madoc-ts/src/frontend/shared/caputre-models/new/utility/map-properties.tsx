import { isEntityList } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import React from 'react';

export function mapProperties(
  entity: CaptureModel['document'],
  render: (info: {
    label: string;
    property: string;
    canInlineField: boolean;
    instances: Array<BaseField | CaptureModel['document']>;
  }) => {}
) {
  const properties = Object.keys(entity.properties);

  return properties.map(property => {
    const instances = entity.properties[property];
    const singleEntity = instances[0];
    const label =
      instances.length > 1 && singleEntity.pluralLabel ? singleEntity.pluralLabel : singleEntity.label || 'Untitled';
    const canInlineField = !isEntityList(instances) && (instances.length === 1 || !singleEntity.selector);
    return (
      <React.Fragment key={property}>
        {render({
          label,
          property,
          instances,
          canInlineField,
        })}
      </React.Fragment>
    );
  });
}

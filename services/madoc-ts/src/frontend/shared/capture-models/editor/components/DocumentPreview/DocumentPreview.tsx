import React, { ComponentClass, FunctionComponent, useMemo } from 'react';
import { filterRevises } from '../../../helpers/filter-revises';
import { isEntity } from '../../../helpers/is-entity';
import { CaptureModel } from '../../../types/capture-model';
import { BaseField } from '../../../types/field-types';
import { FieldPreview } from '../FieldPreview/FieldPreview';

export const DocumentPreview: React.FC<{
  entity: CaptureModel['document'] | BaseField;
  as?: FunctionComponent<any> | ComponentClass<any> | string;
}> = ({ entity, as, children }) => {
  const filteredLabeledBy = useMemo(() => {
    if (isEntity(entity)) {
      if (entity.labelledBy) {
        const properties = filterRevises(entity.properties[entity.labelledBy]);

        if (!properties || properties.length === 0) {
          return undefined;
        }

        return properties as Array<CaptureModel['document'] | BaseField>;
      }
    }

    return undefined;
  }, [entity]);

  if (isEntity(entity)) {
    if (!filteredLabeledBy) {
      return <>{children}</>;
    }

    return (
      <>
        {filteredLabeledBy.map(labelFieldOrEntity => (
          <DocumentPreview key={labelFieldOrEntity.id} entity={labelFieldOrEntity} />
        ))}
      </>
    );
  }

  return <FieldPreview as={as} field={entity} />;
};

import React, { ComponentClass, FunctionComponent, useMemo } from 'react';
import { FieldPreview } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import { getEntityLabel } from './utility/get-entity-label';

export const DocumentPreview: React.FC<{
  entity: CaptureModel['document'] | BaseField;
  as?: FunctionComponent<any> | ComponentClass<any> | string;
}> = ({ entity, as, children }) => {
  const filteredLabeledBy = useMemo(() => {
    if (isEntity(entity)) {
      return getEntityLabel(entity, undefined, true);
    }

    return undefined;
  }, [entity]);

  if (isEntity(entity)) {
    if (!filteredLabeledBy) {
      return <>{children}</>;
    }

    return <>{filteredLabeledBy}</>;
  }

  return <FieldPreview as={as} field={entity} />;
};

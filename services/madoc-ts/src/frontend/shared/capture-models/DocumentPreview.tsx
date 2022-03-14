import React, { ComponentClass, FunctionComponent, useMemo } from 'react';
import { FieldPreview } from './editor/components/FieldPreview/FieldPreview';
import { isEntity } from './helpers/is-entity';
import { CaptureModel } from './types/capture-model';
import { BaseField } from './types/field-types';
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

import React, { ComponentClass, FunctionComponent, ReactNode, useMemo } from 'react';
import { FieldPreview } from './editor/components/FieldPreview/FieldPreview';
import { isEntity } from './helpers/is-entity';
import { CaptureModel } from './types/capture-model';
import { BaseField } from './types/field-types';
import { getEntityLabel } from './utility/get-entity-label';

export function DocumentPreview({
  entity,
  as,
  wrapper = a => a,
  children,
}: {
  wrapper?: (element: React.ReactElement) => React.ReactElement;
  entity: CaptureModel['document'] | BaseField;
  as?: FunctionComponent<any> | ComponentClass<any> | string;
  children: any;
}) {
  const filteredLabeledBy = useMemo(() => {
    if (isEntity(entity)) {
      return getEntityLabel(entity, undefined, true);
    }

    return undefined;
  }, [entity]);

  if (isEntity(entity)) {
    if (!filteredLabeledBy) {
      return wrapper(children);
    }

    return wrapper(<>{filteredLabeledBy}</>);
  }

  return wrapper(<FieldPreview as={as} field={entity} />);
}

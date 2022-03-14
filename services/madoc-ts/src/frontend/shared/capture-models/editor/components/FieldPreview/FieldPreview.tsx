import React, { ComponentClass, FunctionComponent } from 'react';
import { useFieldPreview } from '../../../plugin-api/hooks/use-field-preview';
import { BaseField } from '../../../types/field-types';

export const FieldPreview: React.FC<{
  field: BaseField;
  as?: FunctionComponent<any> | ComponentClass<any> | string;
}> = ({ field }) => {
  const preview = useFieldPreview(field);

  return React.createElement(React.Fragment, {}, preview);
};

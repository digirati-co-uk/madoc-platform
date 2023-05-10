import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { CheckboxField, CheckboxFieldProps } from './CheckboxField';
import { CheckboxFieldPreview } from './CheckboxField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'checkbox-field': CheckboxFieldProps;
  }
}

const specification: FieldSpecification<CheckboxFieldProps> = {
  defaultValue: false,
  type: 'checkbox-field',
  label: 'Checkbox Field',
  defaultProps: {},
  allowMultiple: true,
  TextPreview: CheckboxFieldPreview,
  description: 'Simple checkbox boolean value',
  Component: CheckboxField,
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './CheckboxField.editor')),
};

registerField(specification);

export default specification;

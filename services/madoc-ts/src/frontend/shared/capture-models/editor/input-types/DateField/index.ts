import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { DateField, DateFieldProps } from './DateField';
import { DateFieldPreview } from './DateField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'date-field': DateFieldProps;
  }
}

const specification: FieldSpecification<DateFieldProps> = {
  label: 'Date field',
  type: 'date-field',
  description: 'Typed date (DD-MM-YYYY)',
  Component: DateField,
  defaultValue: '',
  allowMultiple: true,
  maxMultiple: 99,
  required: false,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './DateField.editor')),
  TextPreview: DateFieldPreview,
};

registerField(specification);

export default specification;

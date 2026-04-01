import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { ReadOnlyField, ReadOnlyFieldProps } from './ReadOnlyField';
import { ReadOnlyFieldPreview } from './ReadOnlyField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'read-only-field': ReadOnlyFieldProps;
  }
}

const specification: FieldSpecification<ReadOnlyFieldProps> = {
  label: 'Read-only field',
  type: 'read-only-field',
  description: 'Text field that cannot be edited by contributors',
  Component: ReadOnlyField,
  defaultValue: '',
  allowMultiple: true,
  maxMultiple: 99,
  required: false,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ '../TextField/TextField.editor')),
  TextPreview: ReadOnlyFieldPreview,
};

registerField(specification);

export default specification;

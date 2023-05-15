import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { BorderField, BorderFieldProps, getEmptyBorder } from './BorderField';
import { BorderFieldPreview } from './BorderField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'border-field': BorderFieldProps;
  }
}

const specification: FieldSpecification<BorderFieldProps> = {
  label: 'Border field',
  type: 'border-field',
  description: 'Ability to choose a border style',
  Component: BorderField,
  defaultValue: getEmptyBorder(),
  allowMultiple: true,
  required: false,
  defaultProps: {
    clearable: true,
  },
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './BorderField.editor')),
  // Editor: TextFieldEditor,
  TextPreview: BorderFieldPreview,
};

registerField(specification);

export default specification;

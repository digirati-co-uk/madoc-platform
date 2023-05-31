import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { TextField, TextFieldProps } from './TextField';
import { TextFieldPreview } from './TextField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'text-field': TextFieldProps;
  }
}

const specification: FieldSpecification<TextFieldProps> = {
  label: 'Text field',
  type: 'text-field',
  description: 'Simple text field for plain text',
  Component: TextField,
  defaultValue: '',
  allowMultiple: true,
  maxMultiple: 99,
  required: false,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './TextField.editor')),
  // Editor: TextFieldEditor,
  TextPreview: TextFieldPreview,
};

registerField(specification);

export default specification;

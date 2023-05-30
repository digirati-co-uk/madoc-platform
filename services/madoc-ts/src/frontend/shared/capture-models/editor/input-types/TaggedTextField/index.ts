import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { TaggedTextFieldProps } from './TaggedTextField';
import { TaggedTextFieldPreview } from './TaggedTextField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'tagged-text-field': TaggedTextFieldProps;
  }
}

const specification: FieldSpecification<TaggedTextFieldProps> = {
  label: 'Tagged text field',
  type: 'tagged-text-field',
  description: 'Text field with custom tags you can apply to text',
  Component: React.lazy(() => import(/* webpackChunkName: "fields" */ './TaggedTextField')),
  defaultValue: '',
  allowMultiple: true,
  maxMultiple: 99,
  required: false,
  defaultProps: {
    preset: 'bentham',
  },
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './TaggedTextField.editor')),
  TextPreview: TaggedTextFieldPreview,
};

registerField(specification);

export default specification;

import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { HTMLFieldProps } from './HTMLField';
import { HTMLFieldPreview } from './HTMLField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'html-field': HTMLFieldProps;
  }
}

const specification: FieldSpecification<HTMLFieldProps> = {
  defaultValue: '',
  type: 'html-field',
  label: 'HTML Field',
  defaultProps: {},
  allowMultiple: true,
  maxMultiple: 99,
  required: false,
  TextPreview: HTMLFieldPreview,
  description: 'HTML WYSIWYG Editor for rich text, with custom HTML tag options',
  Component: React.lazy(() => import(/* webpackChunkName: "fields" */ './HTMLField')),
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './HTMLField.editor')),
};

registerField(specification);

export default specification;

import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { ColorField, ColorFieldProps } from './ColorField';
import { ColorFieldPreview } from './ColorField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'color-field': ColorFieldProps;
  }
}

const specification: FieldSpecification<ColorFieldProps> = {
  label: 'Color field',
  type: 'color-field',
  description: 'Ability to choose a color',
  Component: ColorField,
  defaultValue: '',
  allowMultiple: true,
  defaultProps: {
    clearable: true,
  },
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './ColorField.editor')),
  // Editor: TextFieldEditor,
  TextPreview: ColorFieldPreview,
};

registerField(specification);

export default specification;

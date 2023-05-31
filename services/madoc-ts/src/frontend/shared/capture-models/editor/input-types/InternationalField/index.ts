import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { InternationalField, InternationalFieldProps } from './InternationalField';
import { InternationalFieldPreview } from './InternationalField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'international-field': InternationalFieldProps;
  }
}

const specification: FieldSpecification<InternationalFieldProps> = {
  label: 'International text field',
  type: 'international-field',
  description: 'Text field to create language maps',
  Component: InternationalField,
  defaultValue: { none: [''] },
  allowMultiple: true,
  maxMultiple: 99,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './InternationalField.editor')),
  TextPreview: InternationalFieldPreview,
};

registerField(specification);

export default specification;

import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { AutocompleteField, AutocompleteFieldProps } from './AutocompleteField';
import { AutocompleteFieldPreview } from './AutocompleteField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'autocomplete-field': AutocompleteFieldProps;
  }
}

const specification: FieldSpecification<AutocompleteFieldProps> = {
  defaultValue: undefined,
  type: 'autocomplete-field',
  label: 'Autocomplete Field',
  defaultProps: {},
  allowMultiple: true,
  TextPreview: AutocompleteFieldPreview,
  description: 'Dynamic autocomplete driven by endpoint',
  Component: AutocompleteField,
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './AutocompleteField.editor')) as any,
};

registerField(specification);

export default specification;

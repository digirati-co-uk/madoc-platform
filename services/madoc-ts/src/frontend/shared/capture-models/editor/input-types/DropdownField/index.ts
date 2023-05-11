import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { DropdownField, DropdownFieldProps } from './DropdownField';
import { DropdownFieldPreview } from './DropdownField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'dropdown-field': DropdownFieldProps;
  }
}

const specification: FieldSpecification<DropdownFieldProps> = {
  defaultValue: undefined,
  type: 'dropdown-field',
  label: 'Dropdown Field',
  defaultProps: {},
  allowMultiple: true,
  required: false,
  TextPreview: DropdownFieldPreview,
  description: 'Simple list of static values',
  Component: DropdownField,
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './DropdownField.editor')) as any,
  mapEditorProps: (props: DropdownFieldProps) => {
    return {
      ...props,
      optionsAsText: (props.options || [])
        .map(option => `${option.value},${option.text}${option.label ? `,${option.label}` : ''}`)
        .join('\n'),
    };
  },
  onEditorSubmit: ({ optionsAsText, ...props }: DropdownFieldProps & { optionsAsText: string }): DropdownFieldProps => {
    if (typeof optionsAsText !== 'undefined') {
      return {
        ...props,
        options: optionsAsText.split('\n').map(str => {
          const [value, text, label] = str.split(',');
          return { value, text: text ? text : value, label };
        }),
      };
    }
    return props;
  },
};

registerField(specification);

export default specification;

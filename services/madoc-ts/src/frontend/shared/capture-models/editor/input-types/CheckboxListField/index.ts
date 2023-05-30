import React from 'react';
import { registerField } from '../../../plugin-api/global-store';
import { FieldSpecification } from '../../../types/field-types';
import { CheckboxFieldList, CheckboxListFieldProps } from './CheckboxFieldList';
import { CheckboxListFieldPreview } from './CheckboxListField.preview';

declare module '../../../types/field-types' {
  export interface FieldTypeMap {
    'checkbox-list-field': CheckboxListFieldProps;
  }
}

const specification: FieldSpecification<CheckboxListFieldProps> = {
  defaultValue: {},
  type: 'checkbox-list-field',
  label: 'Checkbox list field',
  defaultProps: {},
  allowMultiple: true,
  maxMultiple: 99,
  required: false,
  TextPreview: CheckboxListFieldPreview,
  description: 'List of checkboxes',
  Component: CheckboxFieldList,
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './CheckboxListField.editor')),
  mapEditorProps: (props: CheckboxListFieldProps) => {
    return {
      ...props,
      optionsAsText: (props.options || []).map(option => `${option.value},${option.label}`).join('\n'),
    };
  },
  onEditorSubmit: ({
    optionsAsText,
    ...props
  }: CheckboxListFieldProps & { optionsAsText: string }): CheckboxListFieldProps => {
    if (typeof optionsAsText !== 'undefined') {
      return {
        ...props,
        options: optionsAsText
          ? optionsAsText.split('\n').map(str => {
              const [value, label] = str.split(',');
              return { value, label };
            })
          : [],
      };
    }
    return props;
  },
};

registerField(specification);

export default specification;

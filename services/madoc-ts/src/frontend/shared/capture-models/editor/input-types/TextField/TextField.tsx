import React from 'react';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { StyledFormInputElement, StyledFormMultilineInputElement } from '../../atoms/StyledForm';

export interface TextFieldProps extends BaseField {
  id: string;
  type: 'text-field';
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  previewInline?: boolean;
  minLines?: number;
  value: string;
}

export const TextField: FieldComponent<TextFieldProps> = ({
  value,
  id,
  placeholder,
  minLines,
  multiline,
  updateValue,
}) => {
  if (multiline) {
    return (
      <StyledFormMultilineInputElement
        name={id}
        id={id}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => updateValue(e.currentTarget.value)}
        minRows={Number(minLines)}
      />
    );
  }

  return (
    <StyledFormInputElement
      name={id}
      id={id}
      placeholder={placeholder}
      value={value || ''}
      onChange={e => updateValue(e.currentTarget.value)}
    />
  );
};

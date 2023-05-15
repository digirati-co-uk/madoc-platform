import React from 'react';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { StyledFormInputElement, StyledFormMultilineInputElement } from '../../atoms/StyledForm';
import { useModelTranslation } from '../../../hooks/use-model-translation';

export interface TextFieldProps extends BaseField {
  id: string;
  type: 'text-field';
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  previewInline?: boolean;
  minLines?: number;
  value: string;
  disabled?: boolean;
}

export const TextField: FieldComponent<TextFieldProps> = ({
  value,
  id,
  placeholder,
  minLines,
  multiline,
  updateValue,
  disabled,
  required,
}) => {
  const { t: tModel } = useModelTranslation();
  const tPlaceholder = placeholder ? tModel(placeholder) : ' ';

  if (multiline) {
    return (
      <StyledFormMultilineInputElement
        name={id}
        id={id}
        placeholder={tPlaceholder}
        value={value || ''}
        required={required}
        disabled={disabled}
        onChange={e => updateValue(e.currentTarget.value)}
        minRows={Number(minLines)}
      />
    );
  }

  return (
    <StyledFormInputElement
      name={id}
      id={id}
      placeholder={tPlaceholder}
      value={value || ''}
      disabled={disabled}
      required={required}
      onChange={e => updateValue(e.currentTarget.value)}
    />
  );
};

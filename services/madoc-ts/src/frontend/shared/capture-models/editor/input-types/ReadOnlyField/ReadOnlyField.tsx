import React from 'react';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { StyledFormInputElement, StyledFormMultilineInputElement } from '../../atoms/StyledForm';
import { useModelTranslation } from '../../../hooks/use-model-translation';

export interface ReadOnlyFieldProps extends BaseField {
  id: string;
  type: 'read-only-field';
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  previewInline?: boolean;
  minLines?: number;
  value: string;
}

export const ReadOnlyField: FieldComponent<ReadOnlyFieldProps> = ({
  value,
  id,
  placeholder,
  minLines,
  multiline,
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
        readOnly
        aria-readonly
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
      required={required}
      readOnly
      aria-readonly
    />
  );
};

import React from 'react';
import { BaseField, FieldComponent } from '../../../types/field-types';
import TextareaAutosize from 'react-textarea-autosize';
import { useModelTranslation } from '../../../hooks/use-model-translation';
import type { TextFieldInputFormat } from '../../../../utility/text-field-format';
import { FormattedTextInput, textInputClass } from './FormattedTextInput';

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
  inputFormat?: TextFieldInputFormat;
  formatTemplate?: string;
  allowNegative?: boolean;
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
  inputFormat,
  formatTemplate,
  allowNegative,
}) => {
  const { t: tModel } = useModelTranslation();
  const tPlaceholder = placeholder ? tModel(placeholder) : ' ';

  if (multiline) {
    return (
      <TextareaAutosize
        className={`${textInputClass} bg-white border-[rgba(5,42,68,0.2)]`}
        name={id}
        id={id}
        placeholder={tPlaceholder}
        value={value || ''}
        required={required}
        disabled={disabled}
        onChange={e => updateValue(e.currentTarget.value)}
        minRows={Number(minLines) || undefined}
      />
    );
  }

  return (
    <FormattedTextInput
      id={id}
      value={value || ''}
      onChange={updateValue}
      placeholder={tPlaceholder}
      disabled={disabled}
      required={required}
      inputFormat={inputFormat}
      formatTemplate={formatTemplate}
      allowNegative={allowNegative}
    />
  );
};

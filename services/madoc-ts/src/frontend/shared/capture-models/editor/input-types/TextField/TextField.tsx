import React from 'react';
import { BaseField, FieldComponent } from '../../../types/field-types';
import TextareaAutosize from 'react-textarea-autosize';
import { useModelTranslation } from '../../../hooks/use-model-translation';
import { useTranslation } from 'react-i18next';
import {
  getTextFieldFormatHint,
  isValidTextFieldValue,
  type TextFieldInputFormat,
} from '../../../../utility/text-field-format';

const inputClass =
  'block m-0 w-full appearance-none rounded-[3px] border bg-white px-[0.8rem] py-[0.4rem] font-[inherit] text-sm leading-6 text-black/90 outline-none focus:border-[#005cc5] disabled:cursor-not-allowed disabled:bg-[#f0f0f0]';

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
}) => {
  const { t: tModel } = useModelTranslation();
  const { t } = useTranslation();
  const tPlaceholder = placeholder ? tModel(placeholder) : ' ';

  if (multiline) {
    return (
      <TextareaAutosize
        className={`${inputClass} border-[rgba(5,42,68,0.2)]`}
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

  const hint = getTextFieldFormatHint(inputFormat);
  const invalid = !isValidTextFieldValue(value || '', inputFormat);
  return (
    <div className="grid gap-1">
      <input
        className={`${inputClass} ${invalid ? 'border-red-600' : 'border-[rgba(5,42,68,0.2)]'}`}
        type="text"
        inputMode={inputFormat === 'number' ? 'decimal' : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={hint ? `${id}-format` : undefined}
        name={id}
        id={id}
        placeholder={tPlaceholder}
        value={value || ''}
        disabled={disabled}
        required={required}
        onChange={e => updateValue(e.currentTarget.value)}
      />
      {hint ? (
        <p id={`${id}-format`} className={`text-xs ${invalid ? 'text-red-700' : 'text-gray-600'}`}>
          {t(hint)}
        </p>
      ) : null}
    </div>
  );
};

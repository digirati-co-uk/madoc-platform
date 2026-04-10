import React from 'react';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { StyledFormInputElement } from '../../atoms/StyledForm';
import { useModelTranslation } from '../../../hooks/use-model-translation';
import { formatDateFieldInput, isValidDateFieldValue } from '../../../../utility/date-field-format';

export interface DateFieldProps extends BaseField {
  id: string;
  type: 'date-field';
  placeholder?: string;
  required?: boolean;
  value: string;
  disabled?: boolean;
}

export const DateField: FieldComponent<DateFieldProps> = ({
  value,
  id,
  placeholder,
  updateValue,
  disabled,
  required,
}) => {
  const { t: tModel } = useModelTranslation();
  const tPlaceholder = placeholder ? tModel(placeholder) : 'DD-MM-YYYY';
  const formattedValue = formatDateFieldInput(value || '');
  const isInvalidDateValue = !isValidDateFieldValue(formattedValue);

  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <StyledFormInputElement
        name={id}
        id={id}
        type="text"
        placeholder={tPlaceholder}
        value={formattedValue}
        disabled={disabled}
        required={required}
        aria-invalid={isInvalidDateValue ? 'true' : 'false'}
        style={{
          borderColor: isInvalidDateValue ? '#dc2626' : undefined,
        }}
        onChange={e => updateValue(formatDateFieldInput(e.currentTarget.value))}
      />
      <div
        style={{
          fontSize: 11,
          lineHeight: '14px',
          color: isInvalidDateValue ? '#b91c1c' : 'rgba(0, 0, 0, 0.65)',
        }}
      ></div>
    </div>
  );
};

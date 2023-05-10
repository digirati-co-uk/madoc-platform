import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompositeInput } from '../../../../form/CompositeInput';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { StyledColor } from '../../atoms/StyledForm';

export interface BorderFieldProps extends BaseField {
  id: string;
  type: 'border-field';
  required?: boolean;
  previewInline?: boolean;
  inlineLabel?: string;
  clearable?: boolean;
  value: BorderValue;
  disabled?: boolean;
}

interface BorderValue {
  color: string;
  opacity: number;
  size: number;
  sizeUnit?: string;
  style: 'solid';
}

export function getEmptyBorder(): BorderValue {
  return {
    color: '#000000',
    opacity: 1,
    size: 0,
    style: 'solid',
  };
}

export const BorderField: FieldComponent<BorderFieldProps> = ({ value, id, updateValue, disabled }) => {
  const { t } = useTranslation();
  const formEl = (
    <StyledColor
      name={id}
      style={{ marginRight: '1em' }}
      id={id}
      value={value.color || ''}
      disabled={disabled}
      onChange={e => updateValue({ ...value, color: e.currentTarget.value })}
    />
  );

  return (
    <CompositeInput.Container>
      <CompositeInput.Input
        type="number"
        value={value.size}
        $filled
        $size="sm"
        onChange={e => updateValue({ ...value, size: e.currentTarget.valueAsNumber })}
      />
      <CompositeInput.Text $left>{value.sizeUnit || 'px'}</CompositeInput.Text>
      <CompositeInput.Text>
        <strong>{value.style || 'solid'}</strong>
      </CompositeInput.Text>
      <CompositeInput.InnerContainer $slim>
        {formEl}
        <CompositeInput.Text>{value.color}</CompositeInput.Text>
        <CompositeInput.Spacer />
        <CompositeInput.Divider />
        <CompositeInput.Stack>
          <CompositeInput.StackLabel htmlFor={`${id}--range`}>{t('Opacity')}</CompositeInput.StackLabel>
          <CompositeInput.StackControl>
            <input
              type="range"
              id={`${id}--range`}
              min={0}
              max={100}
              value={typeof value.opacity !== 'undefined' ? value.opacity * 100 : 100}
              onChange={e => updateValue({ ...value, opacity: e.currentTarget.valueAsNumber / 100 })}
              style={{ width: 70 }}
            />
          </CompositeInput.StackControl>
        </CompositeInput.Stack>
      </CompositeInput.InnerContainer>
    </CompositeInput.Container>
  );
};

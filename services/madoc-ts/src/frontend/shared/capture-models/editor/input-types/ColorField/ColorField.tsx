import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { parseColor, rgbToHex, stringifyColor } from '../../../../../../utility/color';
import { CompositeInput } from '../../../../form/CompositeInput';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { StyledColor } from '../../atoms/StyledForm';

export interface ColorFieldProps extends BaseField {
  id: string;
  type: 'color-field';
  required?: boolean;
  previewInline?: boolean;
  inlineLabel?: string;
  clearable?: boolean;
  value: string;
  disabled?: boolean;
  isAlpha?: boolean;
}

const ResetButton = styled.div`
  font-size: 0.85em;
  align-self: center;
  margin: 0 1em;
  color: #999;
  cursor: pointer;
  padding: 0.2em 0.6em;
  border-radius: 3px;
  &:hover {
    background: #f9f9f9;
  }
`;

function parseValue(color: string, updateValue: (col: string) => void, isAlpha?: boolean) {
  if (!isAlpha) {
    return { color, alpha: 1, updateValue };
  }

  const parsed = parseColor(color);

  return {
    color: rgbToHex(parsed),
    alpha: parsed.a,
    updateValue: (col: string, alpha: number) => {
      const updated = parseColor(col);
      updateValue(stringifyColor({ r: updated.r, g: updated.g, b: updated.b, a: alpha }));
    },
  };
}

export const ColorField: FieldComponent<ColorFieldProps> = ({
  value,
  id,
  updateValue: _updateValue,
  isAlpha = false,
  disabled,
  required = false,
  inlineLabel,
  clearable = true,
}) => {
  const { color, alpha, updateValue } = parseValue(value, _updateValue, isAlpha);
  const colorValue = useRef(color);
  const [currentAlpha, setCurrentAlpha] = useState(alpha);

  const isInvalid = required && (!value || value === '');

  const { t } = useTranslation();
  const formEl = (
    <StyledColor
      required={required}
      name={id}
      style={{ marginRight: '1em' }}
      id={id}
      value={color || ''}
      disabled={disabled}
      onChange={e => {
        colorValue.current = e.currentTarget.value;
        updateValue(e.currentTarget.value, currentAlpha);
      }}
    />
  );

  return (
    <CompositeInput.Container data-is-invalid={isInvalid}>
      <CompositeInput.InnerContainer $slim>
        {formEl}
        <CompositeInput.Text> {inlineLabel ? inlineLabel : value}</CompositeInput.Text>
        <CompositeInput.Spacer />
        {isAlpha ? (
          <>
            <CompositeInput.Divider />
            <CompositeInput.Stack>
              <CompositeInput.StackLabel htmlFor={`${id}-rng1`}>Opacity</CompositeInput.StackLabel>
              <CompositeInput.StackControl>
                <input
                  type="range"
                  id={`${id}-rng1`}
                  value={currentAlpha * 100}
                  min={0}
                  max={100}
                  disabled={disabled}
                  onChange={e => {
                    const newAlpha = e.currentTarget.valueAsNumber / 100;
                    setCurrentAlpha(newAlpha);
                    updateValue(colorValue.current, newAlpha);
                  }}
                />
              </CompositeInput.StackControl>
            </CompositeInput.Stack>
          </>
        ) : null}
        {clearable ? (
          <CompositeInput.Button
            onClick={e => {
              e.preventDefault();
              updateValue('', 0);
            }}
          >
            {t('Clear value')}
          </CompositeInput.Button>
        ) : null}
      </CompositeInput.InnerContainer>
    </CompositeInput.Container>
  );
};

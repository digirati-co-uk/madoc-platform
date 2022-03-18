import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { InlineFieldContainer } from '../../atoms/InlineFieldContainer';
import { StyledColor, StyledFormLabel } from '../../atoms/StyledForm';

export interface ColorFieldProps extends BaseField {
  id: string;
  type: 'color-field';
  required?: boolean;
  previewInline?: boolean;
  inlineLabel?: string;
  clearable?: boolean;
  value: string;
  disabled?: boolean;
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

export const ColorField: FieldComponent<ColorFieldProps> = ({
  value,
  id,
  updateValue,
  disabled,
  inlineLabel,
  clearable = true,
}) => {
  const { t } = useTranslation();
  const formEl = (
    <StyledColor
      name={id}
      style={{ marginRight: '1em' }}
      id={id}
      value={value || ''}
      disabled={disabled}
      onChange={e => updateValue(e.currentTarget.value)}
    />
  );

  return (
    <InlineFieldContainer $inline={!!inlineLabel} $light style={{ display: 'flex' }}>
      <StyledFormLabel style={{ flex: 1 }}>
        {formEl}
        {inlineLabel ? inlineLabel : value}
      </StyledFormLabel>
      {clearable ? <ResetButton onClick={() => updateValue('')}>{t('Clear value')}</ResetButton> : null}
    </InlineFieldContainer>
  );
};

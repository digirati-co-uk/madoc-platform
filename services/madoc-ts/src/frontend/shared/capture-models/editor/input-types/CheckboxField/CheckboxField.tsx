import React from 'react';
import styled, { css } from 'styled-components';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { StyledCheckbox, StyledFormLabel } from '../../atoms/StyledForm';

export interface CheckboxFieldProps extends BaseField {
  type: 'checkbox-field';
  value: boolean;
  inlineLabel?: string;
  disabled?: boolean;
}

const CheckboxContainer = styled.div<{ inline?: boolean }>`
  background: rgba(5, 42, 68, 0.05);
  border: 1px solid rgba(5, 42, 68, 0.1);
  border-radius: 3px;
  ${props =>
    props.inline &&
    css`
      display: inline-block;
    `}
`;

export const CheckboxField: FieldComponent<CheckboxFieldProps> = props => {
  if (props.inlineLabel) {
    return (
      <CheckboxContainer>
        <StyledFormLabel>
          <StyledCheckbox
            name={props.id}
            id={props.id}
            disabled={props.disabled}
            checked={props.value}
            onChange={v => {
              props.updateValue(v.target.checked);
            }}
          />
          {props.inlineLabel}
        </StyledFormLabel>
      </CheckboxContainer>
    );
  }

  return (
    <CheckboxContainer inline>
      <StyledCheckbox
        name={props.id}
        id={props.id}
        checked={props.value}
        onChange={v => {
          props.updateValue(v.target.checked);
        }}
      />
    </CheckboxContainer>
  );
};

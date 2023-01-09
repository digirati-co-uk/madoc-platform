import React from 'react';
import styled, { css } from 'styled-components';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { InlineFieldContainer } from '../../atoms/InlineFieldContainer';
import { StyledCheckbox, StyledFormLabel } from '../../atoms/StyledForm';

export interface CheckboxFieldProps extends BaseField {
  type: 'checkbox-field';
  value: boolean;
  inlineLabel?: string;
  disabled?: boolean;
}

export const CheckboxField: FieldComponent<CheckboxFieldProps> = props => {
  if (props.inlineLabel) {
    return (
      <InlineFieldContainer>
        <StyledFormLabel>
          <StyledCheckbox
            name={props.id}
            id={props.id}
            disabled={props.disabled}
            checked={props.value}
            aria-label={props.inlineLabel}
            onChange={v => {
              props.updateValue(v.target.checked);
            }}
          />
          {props.inlineLabel}
        </StyledFormLabel>
      </InlineFieldContainer>
    );
  }

  return (
    <InlineFieldContainer $inline>
      <StyledCheckbox
        name={props.id}
        id={props.id}
        checked={props.value}
        onChange={v => {
          props.updateValue(v.target.checked);
        }}
      />
    </InlineFieldContainer>
  );
};

import React from 'react';
import styled, { css } from 'styled-components';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { StyledCheckbox, StyledFormLabel } from '../../atoms/StyledForm';
import { useModelTranslation } from '../../../hooks/use-model-translation';

export interface CheckboxListFieldProps extends BaseField {
  type: 'checkbox-list-field';
  options?: Array<{ label: string; value: string }>;
  value: { [key: string]: boolean };
  previewList?: boolean;
  disabled?: boolean;
}

const CheckboxContainer = styled.fieldset<{ inline?: boolean }>`
  background: rgba(5, 42, 68, 0.05);
  border: 1px solid rgba(5, 42, 68, 0.1);
  border-radius: 3px;
  padding: 0;
  margin: 0;
  ${props =>
    props.inline &&
    css`
      display: inline-block;
    `}
`;

export const CheckboxFieldList: FieldComponent<CheckboxListFieldProps> = props => {
  const { t: tModel } = useModelTranslation();
  return (
    <CheckboxContainer disabled={props.disabled}>
      {(props.options || []).map(option => {
        return (
          <StyledFormLabel key={option.value}>
            <StyledCheckbox
              name={props.id}
              value={option.value}
              id={props.id}
              aria-label={option.label}
              checked={props.value[option.value]}
              onChange={v => {
                props.updateValue({
                  ...(props.value || {}),
                  [option.value]: v.target.checked,
                });
              }}
            />
            {tModel(option.label)}
          </StyledFormLabel>
        );
      })}
    </CheckboxContainer>
  );
};

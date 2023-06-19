import React from 'react';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { InlineFieldContainer } from '../../atoms/InlineFieldContainer';
import {
  StyledCheckbox,
  StyledCheckboxContainer,
  StyledCheckboxDescription,
  StyledCheckboxLabel,
  StyledFormLabel,
} from '../../atoms/StyledForm';
import { useModelTranslation } from '../../../hooks/use-model-translation';

export interface CheckboxFieldProps extends BaseField {
  type: 'checkbox-field';
  value: boolean;
  inlineLabel?: string;
  inlineDescription?: string;
  disabled?: boolean;
}

export const CheckboxField: FieldComponent<CheckboxFieldProps> = props => {
  const { t: tModel } = useModelTranslation();
  if (props.inlineLabel) {
    return (
      <InlineFieldContainer>
        <StyledCheckboxContainer data-no-description={!props.inlineDescription}>
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
          <StyledCheckboxLabel>{tModel(props.inlineLabel)}</StyledCheckboxLabel>
          {props.inlineDescription ? (
            <StyledCheckboxDescription>{tModel(props.inlineDescription)}</StyledCheckboxDescription>
          ) : null}
        </StyledCheckboxContainer>
      </InlineFieldContainer>
    );
  }

  return (
    <InlineFieldContainer data-inline>
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

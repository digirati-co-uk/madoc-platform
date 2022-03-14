import React from 'react';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { Dropdown, DropdownOption } from '../../atoms/Dropdown';

export interface DropdownFieldProps extends BaseField {
  type: 'dropdown-field';
  value: string | undefined;
  placeholder?: string;
  options: DropdownOption[];
  clearable?: boolean;
  disabled?: boolean;
}

export const DropdownField: FieldComponent<DropdownFieldProps> = props => {
  return (
    <Dropdown
      id={props.id}
      disabled={props.disabled}
      options={props.options || []}
      placeholder={props.placeholder}
      value={props.value}
      isClearable={props.clearable}
      onChange={v => {
        props.updateValue(v);
      }}
    />
  );
};

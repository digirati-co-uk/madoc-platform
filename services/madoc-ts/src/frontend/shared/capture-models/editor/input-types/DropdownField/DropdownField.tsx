import React from 'react';
import { InlineSelect } from '../../../../components/InlineSelect';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { Dropdown, DropdownOption } from '../../atoms/Dropdown';

export interface DropdownFieldProps extends BaseField {
  type: 'dropdown-field';
  value: string | undefined;
  placeholder?: string;
  options: DropdownOption[];
  clearable?: boolean;
  disabled?: boolean;
  inline?: boolean;
}

export const DropdownField: FieldComponent<DropdownFieldProps> = props => {
  if (props.inline) {
    return (
      <InlineSelect
        options={props.options.map(o => ({ label: o.text, value: o.value }))}
        value={props.value}
        onChange={props.updateValue}
        onDeselect={props.clearable ? () => props.updateValue(undefined) : undefined}
      />
    );
  }

  return (
    <Dropdown
      id={props.id}
      disabled={props.disabled}
      options={props.options || []}
      placeholder={props.placeholder}
      value={props.value}
      isClearable={props.clearable}
      onChange={v => {
        props.updateValue(v || undefined);
      }}
    />
  );
};

import React, { useContext } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import type { FieldSpecification } from '../../../types/field-types';
import { Dropdown } from '../../atoms/Dropdown';
import { resolveFieldType } from './resolve-field-type';

type Props = {
  onChange: (term?: string) => void;
  fieldType?: string;
  allowedFieldTypes?: string[];
};

export function ChooseFieldButton({ onChange, fieldType, allowedFieldTypes }: Props) {
  const { fields } = useContext(PluginContext);
  // Field registration mutates this registry in place, so read its current entries on each render.
  const options = Object.values(fields)
    .filter((field): field is FieldSpecification => !!field)
    .filter(field => !allowedFieldTypes || allowedFieldTypes.includes(field.type))
    .map(field => ({
      key: field.type,
      value: field.type,
      text: field.label,
      label: field.type,
    }));
  const availableTypes = options.map(option => option.value);
  const selectedValue = resolveFieldType(availableTypes, fieldType);

  return (
    <Dropdown
      placeholder="Select input"
      fluid
      selection
      disabled={options.length === 0}
      value={selectedValue}
      onChange={v => {
        onChange(resolveFieldType(availableTypes, v || undefined));
      }}
      options={options}
    />
  );
}

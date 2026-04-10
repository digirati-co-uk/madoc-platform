import React, { useContext, useMemo } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { Dropdown } from '../../atoms/Dropdown';

type Props = {
  onChange: (term?: string) => void;
  fieldType?: string;
  allowedFieldTypes?: string[];
};

export const ChooseFieldButton: React.FC<Props> = ({ onChange, fieldType, allowedFieldTypes }) => {
  const { fields } = useContext(PluginContext);
  const options = useMemo(
    () =>
      Object.values(fields)
        .filter((field): field is { type: string; label: string } => !!field)
        .filter(field => !allowedFieldTypes || allowedFieldTypes.includes(field.type))
        .map(field => ({
          key: field.type,
          value: field.type,
          text: field.label,
          label: field.type,
        })),
    [allowedFieldTypes, fields]
  );
  const fallbackType = options.find(option => option.value === 'text-field')?.value || options[0]?.value;
  const selectedValue = options.find(option => option.value === fieldType)?.value || fallbackType;

  return (
    <Dropdown
      placeholder="Select input"
      fluid
      selection
      value={selectedValue}
      onChange={v => {
        onChange(v || fallbackType || undefined);
      }}
      options={options}
    />
  );
};

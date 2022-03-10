import React, { useContext, useState } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { Dropdown } from '../../atoms/Dropdown';

type Props = {
  onChange: (term?: string) => void;
  fieldType?: string;
};

// - Choose type select
// - Choose label
// - Choose term / JSON property

export const ChooseFieldButton: React.FC<Props> = ({ onChange, fieldType }) => {
  const { fields } = useContext(PluginContext);
  const [value, setValue] = useState(fieldType || fields[0]?.type);

  return (
    <Dropdown
      placeholder="Select input"
      fluid
      selection
      value={value}
      onChange={v => {
        onChange(v);
        setValue(v);
      }}
      options={
        Object.values(fields)
          .map(field =>
            field
              ? {
                  key: field.type,
                  value: field.type,
                  text: field.label,
                  label: field.type,
                }
              : null
          )
          .filter(e => e !== null) as any[]
      }
    />
  );
};

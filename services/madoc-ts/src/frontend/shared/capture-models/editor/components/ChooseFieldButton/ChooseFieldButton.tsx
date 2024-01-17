import React, { useContext, useEffect, useState } from 'react';
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
  const textSelector = fields['text-field'];
  const [value, setValue] = useState(fieldType || (textSelector ? 'text-field' : undefined));

  useEffect(() => {
    onChange(value);
    // Adding onChange here results in infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Dropdown
      placeholder="Select input"
      fluid
      selection
      value={value}
      onChange={v => {
        setValue(v || '');
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

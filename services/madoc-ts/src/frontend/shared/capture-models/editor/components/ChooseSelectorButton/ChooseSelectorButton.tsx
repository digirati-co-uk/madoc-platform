import React, { useContext, useState } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { Dropdown, DropdownOption } from '../../atoms/Dropdown';
// Pull in the build-in selectors.
import '../../selector-types/BoxSelector/index';
import { useTranslation } from 'react-i18next';

type Props = {
  value?: string;
  onChange: (term?: string) => void;
};

export const ChooseSelectorButton: React.FC<Props> = ({ value: initialValue, onChange }) => {
  const { t } = useTranslation();
  const { selectors } = useContext(PluginContext);
  const [value, setValue] = useState(initialValue);

  return (
    <div>
      <Dropdown
        placeholder={t('Choose a selector')}
        fluid
        selection
        value={value}
        onChange={val => {
          onChange(val);
          setValue(val);
        }}
        options={[
          {
            key: '',
            value: '',
            text: 'none',
          },
          ...(Object.values(selectors)
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
            .filter(e => e !== null) as DropdownOption[]),
        ]}
      />
    </div>
  );
};

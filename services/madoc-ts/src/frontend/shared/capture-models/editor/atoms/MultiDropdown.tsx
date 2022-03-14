import { useCallback, useMemo } from 'react';
import React from 'react';
import { Select } from 'react-functional-select';
import { DropdownOption, renderOptionLabel } from './Dropdown';

export type MultiDropdownProps = {
  id?: string;
  placeholder?: string;
  fluid?: boolean;
  disabled?: boolean;
  selection?: boolean;
  isClearable?: boolean;
  value?: string[];
  options: Array<DropdownOption>;
  onChange: (value?: string[]) => void;
};

function getValue(option: DropdownOption) {
  return option.value;
}

function getLabel(option: DropdownOption) {
  return option.text;
}

export const MultiDropdown: React.FC<MultiDropdownProps> = ({
  id,
  placeholder,
  isClearable,
  value,
  disabled,
  options,
  onChange,
}) => {
  const onOptionChange = useCallback((option: DropdownOption[] | null): void => {
    if (option) {
      onChange(option ? option.map(opt => opt.value) : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialValue = useMemo(() => {
    return options.filter(item => (value ? value.indexOf(item.value) !== -1 : false));
  }, [options, value]);

  return (
    <Select
      themeConfig={{
        color: {
          primary: '#005cc5',
        },
        control: {
          boxShadow: '0 0 0 0',
          focusedBorderColor: '#005cc5',
          selectedBgColor: '#005cc5',
          backgroundColor: '#fff',
          borderRadius: '3px',
        },
      }}
      inputId={id}
      initialValue={initialValue}
      placeholder={placeholder}
      options={options}
      isMulti={true}
      isDisabled={disabled}
      isClearable={isClearable}
      onOptionChange={onOptionChange}
      getOptionValue={getValue}
      getOptionLabel={getLabel}
      renderOptionLabel={renderOptionLabel}
    />
  );
};

import { Tag } from '@capture-models/editor';
import React, { useEffect, useRef, useState } from 'react';
import { Select } from 'react-functional-select';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/use-api';

export type AutocompleteUser = {
  id: number;
  name: string;
  role?: string;
};

type UserAutoCompleteProps = {
  id?: string;
  placeholder?: string;
  value?: AutocompleteUser;
  clearable?: boolean;
  updateValue: (user?: AutocompleteUser) => void;
};

function renderOptionLabel(option: AutocompleteUser) {
  return (
    <>
      <strong style={{ lineHeight: '1.8em', verticalAlign: 'middle' }}>{option.name}</strong>
      {option.role ? <Tag style={{ float: 'right', marginLeft: 10 }}>{option.role}</Tag> : null}
    </>
  );
}

export const UserAutocomplete: React.FC<UserAutoCompleteProps> = props => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<any[]>(props.value ? [props.value] : []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const api = useApi();
  const ref = useRef<any>();

  const onOptionChange = (option: AutocompleteUser | undefined) => {
    if (!option) {
      props.updateValue(undefined);
      return;
    }

    if (!props.value || option.id !== props.value.id) {
      props.updateValue(option);
    }
  };

  useEffect(() => {
    if (typeof props.value === 'undefined') {
      if (ref.current) {
        ref.current.clearValue();
      }
    }
  }, [props.value]);

  const onInputChange = () => {
    setIsLoading(true);
  };

  const onSearchChange = async (value: string | undefined) => {
    if (value) {
      try {
        const items = await api.userAutocomplete(value);
        // Make API Request.
        setOptions(items.users);
        setIsLoading(false);
        setError('');
      } catch (err) {
        setError(t('Unable to fetch users'));
      }
    }
  };

  return (
    <Select
      ref={ref}
      themeConfig={{
        color: {
          primary: '#005cc5',
        },
        control: {
          boxShadow: '0 0 0 0',
          focusedBorderColor: '#005cc5',
          selectedBgColor: '#005cc5',
          backgroundColor: '#fff',
        },
      }}
      isInvalid={!!error}
      inputId={props.id}
      initialValue={options[0]}
      placeholder={props.placeholder ? t(props.placeholder) : t('Select option...')}
      options={options}
      isLoading={isLoading}
      isClearable={props.clearable}
      onOptionChange={onOptionChange}
      noOptionsMsg={t('No options')}
      filterMatchFrom="any"
      onInputChange={onInputChange}
      onSearchChange={onSearchChange}
      getOptionValue={option => option.id}
      getOptionLabel={option => option.name}
      renderOptionLabel={renderOptionLabel}
    />
  );
};

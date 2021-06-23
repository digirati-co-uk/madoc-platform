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
  initialQuery?: boolean;
  roles?: string[];
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

  useEffect(() => {
    if (props.initialQuery) {
      api.userAutocomplete('', props.roles).then(items => {
        // Make API Request.
        setOptions(alreadyExistingUsers => {
          if (alreadyExistingUsers.length) {
            return alreadyExistingUsers;
          }
          return items.users;
        });
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const items = await api.userAutocomplete(value, props.roles);
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
    <>
      <Select
        ref={ref}
        themeConfig={{
          color: {
            primary: '#005cc5',
          },
          select: {
            css: 'font-size: 0.9em;',
          },
          control: {
            boxShadow: '0 0 0 0',
            focusedBorderColor: '#005cc5',
            selectedBgColor: '#005cc5',
            backgroundColor: '#fff',
          },
          noOptions: {
            fontSize: '.8em',
            padding: '2em 0',
          },
          menu: {
            css: `
              position: fixed;
              width: 500px;
              overflow: hidden;
              border: none;
              box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.18), 0 0px 0px 1px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
            `,
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
    </>
  );
};

import { Tag } from '@styled-icons/entypo';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultSelect } from '../form/DefaulSelect';
import { useApi } from '../hooks/use-api';

export type AutocompleteUser = {
  id: number;
  name: string;
  role?: string;
  email?: string;
};

type UserAutoCompleteProps = {
  id?: string;
  placeholder?: string;
  value?: AutocompleteUser;
  clearable?: boolean;
  initialQuery?: boolean;
  roles?: string[];
  updateValue: (user?: AutocompleteUser) => void;
  allUsers?: boolean;
};

function renderOptionLabel(option: AutocompleteUser) {
  return (
    <>
      <strong style={{ lineHeight: '1.8em', verticalAlign: 'middle' }}>{option.name}</strong>
      {option.email ? (
        <span style={{ lineHeight: '1.8em', fontSize: '0.8em', marginLeft: '1em' }}>{option.email}</span>
      ) : null}
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
      const query = props.allUsers ? api.siteManager.searchAllUsers('') : api.userAutocomplete('', props.roles);

      query.then(items => {
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
    if (value || props.initialQuery) {
      try {
        const items = props.allUsers
          ? await api.siteManager.searchAllUsers(value || '')
          : await api.userAutocomplete(value || '', props.roles);

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
      <DefaultSelect
        ref={ref}
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
        getOptionLabel={option => option.name + (option.email || '')}
        renderOptionLabel={renderOptionLabel}
      />
    </>
  );
};

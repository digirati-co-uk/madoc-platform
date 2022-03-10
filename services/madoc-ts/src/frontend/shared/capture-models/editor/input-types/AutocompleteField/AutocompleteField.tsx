import React, { useEffect, useState, useCallback } from 'react';
import { Select } from 'react-functional-select';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { ErrorMessage } from '../../atoms/Message';
import { Tag } from '../../atoms/Tag';
import { useTranslation } from 'react-i18next';

export interface AutocompleteFieldProps extends BaseField {
  type: 'autocomplete-field';
  value: { uri: string; label: string; resource_class?: string } | undefined;
  placeholder?: string;
  clearable?: boolean;
  requestInitial?: boolean;
  dataSource: string;
}

export type CompletionItem = {
  uri: string;
  label: string;
  resource_class?: string;
  score?: number;
};

function renderOptionLabel(option: CompletionItem) {
  return (
    <>
      <strong style={{ lineHeight: '1.8em', verticalAlign: 'middle' }}>{option.label}</strong>
      {option.resource_class ? <Tag style={{ float: 'right', marginLeft: 10 }}>{option.resource_class}</Tag> : null}
    </>
  );
}

export const AutocompleteField: FieldComponent<AutocompleteFieldProps> = props => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<CompletionItem[]>(props.value ? [props.value] : []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState('');

  const onOptionChange = (option: CompletionItem | undefined) => {
    if (!option) {
      props.updateValue(undefined);
      return;
    }

    if (!props.value || option.uri !== props.value.uri) {
      props.updateValue(
        option ? { label: option.label, resource_class: option.resource_class, uri: option.uri } : undefined
      );
    }
  };

  const onInputChange = () => {
    setIsLoading(true);
  };

  const onSearchChange = useCallback(
    (value: string | undefined) => {
      if (value || props.requestInitial) {
        if (hasFetched && props.dataSource.indexOf('%') === -1) {
          setIsLoading(false);
          return;
        }
        // Make API Request.
        fetch(`${props.dataSource}`.replace(/%/, value || ''))
          .then(r => r.json() as Promise<{ completions: CompletionItem[] }>)
          .then(items => {
            setOptions(items.completions);
            setIsLoading(false);
            setHasFetched(true);
            setError('');
          })
          .catch(() => {
            setError(t('There was a problem fetching results'));
          });
      }
    },
    [props.requestInitial, props.dataSource, t]
  );

  useEffect(() => {
    if (props.requestInitial) {
      onSearchChange(props.value?.uri || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.requestInitial]);

  return (
    <>
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
        getOptionValue={(option: any) => option.uri}
        getOptionLabel={(option: any) => option.label}
        renderOptionLabel={renderOptionLabel}
      />
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </>
  );
};

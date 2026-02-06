import { InternationalString } from '@iiif/presentation-3';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Select } from '../../../../form/FunctionalSelect';
import { LocaleString } from '../../../../components/LocaleString';
import { useOptionalApi } from '../../../../hooks/use-api';
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
  disabled?: boolean;
  outputIdAsString?: boolean;
}

export type CompletionItem = {
  uri: string;
  label: string | InternationalString;
  resource_class?: string;
  score?: number;

  // Future fields to use.
  description?: string | InternationalString;

  language?: string;
};

function renderOptionLabel(option: CompletionItem) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-1 width-full items-start">
      <LocaleString className="text-md font-semibold" style={{ overflowWrap: 'anywhere' }}>
        {option.label as any}
      </LocaleString>
      {option.resource_class ? (
        <Tag style={{ margin: 0, whiteSpace: 'nowrap', alignSelf: 'start' }}>{option.resource_class}</Tag>
      ) : null}
      {option.description ? (
        <LocaleString
          style={{
            gridColumn: '1 / -1',
            color: '#4b5563',
            overflowWrap: 'anywhere',
          }}
        >
          {option.description as any}
        </LocaleString>
      ) : null}
    </div>
  );
}

export const AutocompleteField: FieldComponent<AutocompleteFieldProps> = props => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<CompletionItem[]>(
    props.value ? [typeof props.value === 'string' ? { uri: props.value, label: 'unknown' } : props.value] : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState('');
  const api = useOptionalApi();
  const pendingFetch = useRef<AbortController>(undefined);
  const onOptionChange = (option: CompletionItem | undefined) => {
    if (!option) {
      props.updateValue(undefined);
      return;
    }

    if (!props.value || option.uri !== props.value.uri) {
      if (props.outputIdAsString) {
        props.updateValue(option?.uri as any);
      } else {
        props.updateValue(
          option ? ({ label: option.label, resource_class: option.resource_class, uri: option.uri } as any) : undefined
        );
      }
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

        if (pendingFetch.current) {
          pendingFetch.current.abort();
        }
        const abortController = new AbortController();
        pendingFetch.current = abortController;

        const fetcher = (): Promise<{ completions: CompletionItem[] }> => {
          if (props.dataSource.startsWith('madoc-api://')) {
            const source = props.dataSource.slice('madoc-api://'.length);
            if (!api) {
              throw new Error('Invalid URL');
            }
            return api.request(`/api/madoc/${source.replace(/%/, value || '')}`);
          }
          return fetch(`${props.dataSource}`.replace(/%/, value || ''), {
            signal: pendingFetch.current?.signal,
          }).then(r => r.json() as Promise<{ completions: CompletionItem[] }>);
        };

        // Make API Request.
        fetcher()
          .then(items => {
            if (abortController.signal.aborted) {
              return;
            }
            pendingFetch.current = undefined;
            setOptions(items.completions);
            setIsLoading(false);
            setHasFetched(true);
            setError('');
          })
          .catch(e => {
            if (abortController.signal.aborted) {
              return;
            }
            console.error(e);
            setError(t('There was a problem fetching results'));
          });
      }
    },
    [props.requestInitial, props.dataSource, hasFetched, api, t]
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
        isDisabled={props.disabled}
        isInvalid={!!error}
        inputId={props.id}
        initialValue={props.value}
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

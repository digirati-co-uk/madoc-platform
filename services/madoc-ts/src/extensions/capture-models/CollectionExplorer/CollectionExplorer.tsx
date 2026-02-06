import { InternationalString } from '@iiif/presentation-3';
import React, { useState } from 'react';
import { Select } from '../../../frontend/shared/form/FunctionalSelect';
import { useTranslation } from 'react-i18next';
import { Tag } from '../../../frontend/shared/capture-models/editor/atoms/Tag';
import { LocaleString } from '../../../frontend/shared/components/LocaleString';
import { useAutocomplete } from '../../../frontend/shared/hooks/use-autocomplete';

export interface CollectionExplorerProps {
  id: string;
  label: string;
  type: string;
  disabled?: boolean;
  value: { id: number; label: InternationalString } | null;
}

function renderOptionLabel(option: any) {
  return (
    <>
      <LocaleString style={{ lineHeight: '1.8em', verticalAlign: 'middle' }}>{option.label}</LocaleString>
      {option.id ? <Tag style={{ float: 'right', marginLeft: 10 }}>{option.id}</Tag> : null}
    </>
  );
}

export function CollectionExplorer({
  value,

  disabled,
  updateValue,
}: CollectionExplorerProps & {
  updateValue: (newValue: CollectionExplorerProps['value']) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [performSearch, , searchResults] = useAutocomplete(query);

  function onOptionChange(option: any) {
    updateValue(option);
  }
  function onSearchChange(search?: string) {
    setQuery(search || '');
    performSearch('collection');
  }

  return (
    <div>
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
        initialValue={value}
        isSearchable
        async={true}
        placeholder={t('Search collections')}
        options={searchResults}
        isDisabled={disabled}
        isClearable={true}
        onOptionChange={onOptionChange}
        onSearchChange={onSearchChange}
        getOptionValue={(option: any) => option.id}
        getOptionLabel={(option: any) => <LocaleString>{option.label}</LocaleString>}
        renderOptionLabel={renderOptionLabel}
      />
    </div>
  );
}

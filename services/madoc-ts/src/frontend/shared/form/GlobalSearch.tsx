import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { SearchIcon } from '../icons/SearchIcon';
import { GlobalSearchButton, GlobalSearchContainer, GlobalSearchForm, GlobalSearchInput } from '../layout/SiteHeader';

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { t } = useTranslation();
  const { project } = useSiteConfiguration();
  const showSearch = !project.headerOptions?.hideSearchBar;

  if (!showSearch) {
    return null;
  }

  return (
    <GlobalSearchContainer>
      <GlobalSearchForm
        onSubmit={e => {
          e.preventDefault();
          navigate(`/search?fulltext=${query}`);
          setQuery('');
        }}
      >
        <GlobalSearchInput
          type="text"
          name="fulltext"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
          }}
          placeholder={t('Search')}
        />
        <GlobalSearchButton type="submit">{t('Search')}</GlobalSearchButton>
      </GlobalSearchForm>
    </GlobalSearchContainer>
  );
};

blockEditorFor(GlobalSearch, {
  type: 'default.GlobalSearch',
  internal: true,
  label: 'Global site search',
  svgIcon: SearchIcon as any,
  source: { id: 'global-header', type: 'global', name: 'Global header' },
  editor: {},
});

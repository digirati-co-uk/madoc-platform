import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { SearchIcon } from '../icons/SearchIcon';

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
    <div className="w-80 border-2 rounded-full overflow-hidden focus-within:border-blue-500 mr-4 bg-white">
      <form
        className="flex h-10"
        onSubmit={e => {
          e.preventDefault();
          navigate(`/search?fulltext=${query}`);
          setQuery('');
        }}
      >
        <input
          className="flex-1 pl-5 outline-none"
          type="text"
          name="fulltext"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
          }}
          placeholder={t('Search')}
        />
        <button className="hover:bg-slate-100 w-12 m-1 flex items-center justify-center rounded-full" type="submit">
          <SearchIcon title={t('Search')} />
        </button>
      </form>
    </div>
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

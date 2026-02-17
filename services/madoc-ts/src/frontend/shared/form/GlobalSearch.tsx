import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { SearchIcon } from '../icons/SearchIcon';
import {
  resolveTypesenseHitPrimaryLink,
  useTypesenseSiteAutocomplete,
} from '../hooks/use-typesense-site-autocomplete';

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();
  const { project } = useSiteConfiguration();
  const showSearch = !project.headerOptions?.hideSearchBar;
  const { available: typesenseAvailable, suggestions, isLoadingSuggestions } = useTypesenseSiteAutocomplete(query, {
    enabled: showSearch,
    limit: 8,
  });

  if (!showSearch) {
    return null;
  }

  const trimmedQuery = query.trim();
  const showSuggestions = typesenseAvailable && isFocused && trimmedQuery.length > 1;

  return (
    <div className="relative w-80 mr-4">
      <div className="border-2 rounded-full overflow-hidden focus-within:border-blue-500 bg-white">
        <form
          className="flex h-10"
          onSubmit={e => {
            e.preventDefault();
            navigate(`/search?fulltext=${encodeURIComponent(trimmedQuery)}`);
            setQuery('');
            setIsFocused(false);
          }}
        >
          <input
            className="flex-1 pl-5 outline-none"
            type="text"
            name="fulltext"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 100);
            }}
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
      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 bg-white rounded-md border border-slate-200 shadow-lg max-h-80 overflow-y-auto">
          {isLoadingSuggestions && suggestions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">Loading suggestions...</div>
          ) : null}
          {!isLoadingSuggestions && suggestions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No suggestions</div>
          ) : null}
          {suggestions.map(suggestion => {
            const resourceLink = resolveTypesenseHitPrimaryLink(suggestion);
            const fallbackQuery = suggestion.resource_label || suggestion.resource_id || trimmedQuery;
            const target = resourceLink || `/search?fulltext=${encodeURIComponent(fallbackQuery || '')}`;
            return (
              <button
                key={suggestion.resource_id || `${suggestion.resource_type}-${fallbackQuery}`}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                onMouseDown={event => {
                  event.preventDefault();
                  navigate(target);
                  setQuery('');
                  setIsFocused(false);
                }}
              >
                <div className="text-sm font-medium text-slate-800 truncate">{suggestion.resource_label || 'Untitled'}</div>
                <div className="text-xs text-slate-500 truncate">
                  {suggestion.resource_type || 'Resource'}
                  {suggestion.resource_id ? ` | ${suggestion.resource_id}` : ''}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
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

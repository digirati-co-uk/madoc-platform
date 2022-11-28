import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { useTranslation } from 'react-i18next';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';

import { useSearch } from '../hooks/use-search';
import { useSearchQuery } from '../hooks/use-search-query';
import { StaticPage } from '../features/StaticPage';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { SearchPageResults } from '../features/SearchPageResults';

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const [{ resolvedData: searchResponse, latestData }, displayFacets, isLoading] = useSearch();
  const { rawQuery, page, fulltext } = useSearchQuery();

  return (
    <StaticPage title="search">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 300 }}>
          <Slot name="search-filters" small>
            <SearchPageFilters displayFacets={displayFacets} />
          </Slot>
        </div>

        <div style={{ width: '100%' }}>
          <Slot name="search-page-results">
            {isLoading && !searchResponse ? (
              <LoadingBlock />
            ) : (
              <SearchPageResults
                results={searchResponse}
                page={page}
                isLoading={isLoading}
                latestData={latestData}
                rawQuery={rawQuery}
                ft={fulltext}
              />
            )}
          </Slot>
        </div>
      </div>
    </StaticPage>
  );
};

import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { useTranslation } from 'react-i18next';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';

import { useSearch } from '../hooks/use-search';
import { useSearchQuery } from '../hooks/use-search-query';
import { StaticPage } from '../features/StaticPage';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { SearchResults, TotalResults } from '../../shared/components/SearchResults';
import { Pagination } from '../../shared/components/Pagination';
import { AppliedFacets } from '../features/AppliedFacets';
import { Heading1 } from '../../shared/typography/Heading1';

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const [{ resolvedData: searchResponse, latestData }, displayFacets, isLoading] = useSearch();
  const { rawQuery, page, fulltext } = useSearchQuery();

  return (
    <StaticPage title="search">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="search-heading">
        <Heading1>“{fulltext}” search</Heading1>
      </Slot>
      <Slot name="search-facets">
        <AppliedFacets />
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 300 }}>
          <Slot name="search-filters1" small>
            <SearchPageFilters />
          </Slot>
        </div>

        <div style={{ width: '100%' }}>
          <Slot name="search-page-results1">
            {isLoading && !searchResponse ? (
              <LoadingBlock />
            ) : (
              <TotalResults>
                {t('Found {{count}} results', {
                  count: searchResponse && searchResponse.pagination ? searchResponse.pagination.totalResults : 0,
                })}
              </TotalResults>
            )}
            <Pagination
              page={page}
              totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
              stale={isLoading}
              extraQuery={rawQuery}
            />
            <SearchResults
              isFetching={isLoading}
              value={fulltext}
              searchResults={searchResponse ? searchResponse.results : []}
            />
            <Pagination
              page={page}
              totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
              stale={isLoading}
              extraQuery={rawQuery}
            />
          </Slot>
        </div>
      </div>
    </StaticPage>
  );
};

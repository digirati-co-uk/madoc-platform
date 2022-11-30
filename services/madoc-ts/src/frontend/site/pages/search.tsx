import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { useTranslation } from 'react-i18next';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { useSearch } from '../hooks/use-search';
import { useSearchQuery } from '../hooks/use-search-query';
import { StaticPage } from '../features/StaticPage';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { SearchResults, TotalResults } from '../../shared/components/SearchResults';
import { AppliedFacets } from '../features/AppliedFacets';
import { Heading1 } from '../../shared/typography/Heading1';
import { SearchPagination } from '../features/SearchPagination';
import { SearchPageResults } from "../features/SearchPageResults";

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const [{ resolvedData: searchResponse, latestData }, displayFacets, isLoading] = useSearch();
  const { rawQuery, page, fulltext } = useSearchQuery();

  return (
    <StaticPage title="search">
      <Slot name="search-heading">
        <Heading1>“{fulltext}” search</Heading1>
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 300 }}>
          <Slot name="search-filters1" small>
            <SearchPageFilters />
          </Slot>
        </div>

        <div style={{ width: '100%' }}>
          <Slot name="search-page-pagination">
            <SearchPagination />
          </Slot>

          <Slot name="search-page-resultse">
            <AppliedFacets />
            {isLoading && !searchResponse ? (
              <LoadingBlock />
            ) : (
              <TotalResults>
                {t('Found {{count}} results', {
                  count: searchResponse && searchResponse.pagination ? searchResponse.pagination.totalResults : 0,
                })}
              </TotalResults>
            )}

            <SearchPageResults />

            {/*<SearchResults*/}
            {/*  isFetching={isLoading}*/}
            {/*  value={fulltext}*/}
            {/*  searchResults={searchResponse ? searchResponse.results : []}*/}
            {/*/>*/}
          </Slot>

          <Slot name="search-page-footer">
            <SearchPagination />
          </Slot>
        </div>
      </div>
    </StaticPage>
  );
};

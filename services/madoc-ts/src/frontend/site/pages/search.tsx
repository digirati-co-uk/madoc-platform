import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { useSearchQuery } from '../hooks/use-search-query';
import { StaticPage } from '../features/StaticPage';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { AppliedFacets } from '../features/AppliedFacets';
import { Heading1 } from '../../shared/typography/Heading1';
import { SearchPagination } from '../features/SearchPagination';
import { SearchPageResults } from '../features/SearchPageResults';

export const Search: React.FC = () => {
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

          <Slot name="search-page-results">
            <AppliedFacets />
            <SearchPageResults />
          </Slot>

          <Slot name="search-page-footer">
            <SearchPagination />
          </Slot>
        </div>
      </div>
    </StaticPage>
  );
};

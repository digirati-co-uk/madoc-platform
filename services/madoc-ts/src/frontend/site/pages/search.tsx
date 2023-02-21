import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { AppliedFacets } from '../features/AppliedFacets';
import { SearchPagination } from '../features/SearchPagination';
import { SearchPageResults } from '../features/SearchPageResults';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { SearchHeading } from '../features/SearchPageHeading';
import { StaticPage } from '../features/StaticPage';

export const Search = () => {
  return (
    <StaticPage title="search">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs currentPage="Search" />
      </Slot>

      <Slot name="search-page-heading">
        <SearchHeading />
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 300 }}>
          <Slot name="search-page-filters" small>
            <SearchPageFilters />
          </Slot>
        </div>

        <div style={{ width: '100%' }}>
          <Slot name="search-page-pagination">
            <SearchPagination />
          </Slot>

          <Slot name="search-page-results">
            <SearchPagination />
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

import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { AppliedFacets } from '../features/AppliedFacets';
import { SearchPagination } from '../features/SearchPagination';
import { SearchPageResults } from '../features/SearchPageResults';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { SearchHeading } from '../features/SearchPageHeading';
import { StaticPage } from '../features/StaticPage';
import { useRouteContext } from '../hooks/use-route-context';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import {useLocation} from "react-router-dom";

export const Search = () => {
  const { topic } = useRouteContext();
  const { hash } = useLocation();
  const topicId = topic && hash ? hash.replace(/#/, '') : undefined;

  return (
    <StaticPage title="search">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs currentPage={'Search'} />
      </Slot>

      <Slot name="search-page-heading">
        <SearchHeading />
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 300 }}>
          <Slot name="search-page-filters" small>
            <SearchPageFilters topicId={topicId} />
          </Slot>
        </div>

        <div style={{ width: '100%' }}>
          <Slot name="search-page-pagination">
            <SearchPagination topicId={topicId} />
          </Slot>

          <Slot name="search-page-results">
            <AppliedFacets />
            <SearchPageResults topicId={topicId} />
          </Slot>

          <Slot name="search-page-footer">
            <SearchPagination topicId={topicId} />
          </Slot>
        </div>
      </div>
    </StaticPage>
  );
};

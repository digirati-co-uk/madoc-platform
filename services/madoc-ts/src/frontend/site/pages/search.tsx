import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { useSearchQuery } from '../hooks/use-search-query';
import { StaticPage } from '../features/StaticPage';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { AppliedFacets } from '../features/AppliedFacets';
import { Heading1 } from '../../shared/typography/Heading1';
import { SearchPagination } from '../features/SearchPagination';
import { SearchPageResults } from '../features/SearchPageResults';
import { DisplayBreadcrumbs, useBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { useRouteContext } from '../hooks/use-route-context';
import { LocaleString } from '../../shared/components/LocaleString';

export const Search: React.FC = () => {
  const { rawQuery, page, fulltext } = useSearchQuery();

  const breads = useBreadcrumbs();
  const isGlobal = !!breads.subpage;

  const getHeading = () => {
    if (breads.manifest) return breads.manifest?.name;
    else if (breads.collection) return breads.collection.name;
    else {
      return breads.project?.name;
    }
  };

  return (
    <StaticPage title="Search">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs currentPage="Search" />
      </Slot>

      <Slot name="search-heading">
        {isGlobal ? (
          <Heading1>“{fulltext}” search</Heading1>
        ) : (
          <Heading1>
            search in <LocaleString>{getHeading()}</LocaleString>
          </Heading1>
        )}
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

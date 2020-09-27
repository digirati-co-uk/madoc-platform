import { stringify } from 'query-string';
import React from 'react';
import { SearchResults } from '../../shared/components/SearchResults';
import { SearchFacets } from '../../shared/components/SearchFacets';

import { PaginationNumbered } from '../../shared/components/Pagination';
import { useTranslation } from 'react-i18next';
import { useLocationQuery } from '../../shared/hooks/use-location-query';

import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../frontend/types';

import { useHistory, useLocation } from 'react-router-dom';
import { usePaginatedData } from '../../shared/hooks/use-data';

import styled from 'styled-components';

import { SearchResponse } from '../../../types/search';

// const options = [
//   { value: 'Option1', text: 'Option 1' },
//   { value: 'Option2', text: 'Option 2' },
//   { value: 'Option3', text: 'Option 3' },
// ];

const SearchContainer = styled.div`
  display: flex;
`;

type SearchListType = {
  data: SearchResponse | undefined;
  params: {};
  query: { page: number; fulltext: string };
  variables: { page: number; fulltext: string };
};

export const Search: UniversalComponent<SearchListType> = createUniversalComponent<SearchListType>(
  () => {
    const { status, data } = usePaginatedData(Search);
    const { t } = useTranslation();
    const { page, fulltext } = useLocationQuery();
    const history = useHistory();
    const { pathname } = useLocation();

    return status === 'loading' ? (
      <div>{t('Loading')}</div>
    ) : (
      <>
        <SearchContainer>
          <SearchFacets
            facets={data && data.facets && data.facets.metadata ? Object.entries(data.facets.metadata) : []}
            facetChange={() => {}}
          />
          <SearchResults
            searchFunction={val => {
              history.push(`${pathname}?${stringify({ fulltext: val, page })}`);
            }}
            value={fulltext}
            totalResults={data && data.pagination ? data.pagination.totalResults : 0}
            searchResults={data ? data.results : []}
            sortByFunction={val => {
              // alert('you sorted by:  ' + val);
            }}
          />
        </SearchContainer>
        <PaginationNumbered
          page={data && data.pagination ? data.pagination.page : 1}
          totalPages={data && data.pagination ? data.pagination.totalPages : 1}
          stale={false}
          extraQuery={{ fulltext }}
        />
      </>
    );
  },
  {
    getKey(params: {}, query: { page: number; fulltext: string }) {
      return ['response', { page: query.page ? Number(query.page) : 1, fulltext: query.fulltext }];
    },
    getData: async (key, vars, api) => {
      if (!vars.fulltext) {
        return undefined;
      }

      return await api.searchQuery(
        {
          fulltext: vars.fulltext,
        },
        vars.page
      );
    },
  }
);

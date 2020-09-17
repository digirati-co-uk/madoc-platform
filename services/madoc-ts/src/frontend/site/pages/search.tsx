import React from 'react';
import { SearchFacets } from '../../shared/components/SearchFacets';
import { SearchResults } from '../../shared/components/SearchResults';
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
  data: SearchResponse;
  params: {};
  query: { page: number; fulltext: string };
  variables: { page: number; fulltext: string };
};

export const Search: UniversalComponent<SearchListType> = createUniversalComponent<SearchListType>(
  () => {
    const { status, data } = usePaginatedData(Search);
    const { t } = useTranslation();
    const { fulltext } = useLocationQuery();
    const history = useHistory();
    const { pathname } = useLocation();

    return status === 'loading' ? (
      <div>{t('Loading')}</div>
    ) : (
      <>
        <SearchContainer>
          {/* <SearchFacets
          facets={searchResults.facets}
          facetChange={(val, facet) => alert('you changed Facet ' + facet + ' to the value ' + val)}
        /> */}
          <SearchResults
            searchFunction={val => {
              history.push(`${pathname}?fulltext=${val}`);
            }}
            value={fulltext}
            totalResults={data && data.pagination ? data.pagination.totalResults : 0}
            searchResults={data ? data.results : []}
            sortByFunction={val => {
              alert('you sorted by:  ' + val);
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
      return ['response', { page: Number(query.page), fulltext: query.fulltext }];
    },
    getData: async (key, vars, api) => {
      return await api.search(vars.fulltext, vars.page);
    },
  }
);

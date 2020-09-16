import React, { useState, useEffect } from 'react';
import { SearchFacets } from '../../shared/components/SearchFacets';
import { SearchResults } from '../../shared/components/SearchResults';
import { PaginationNumbered } from '../../shared/components/Pagination';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../frontend/types';

import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';

import styled from 'styled-components';

import { SearchResponse } from '../../../types/schemas/search';

// const options = [
//   { value: 'Option1', text: 'Option 1' },
//   { value: 'Option2', text: 'Option 2' },
//   { value: 'Option3', text: 'Option 3' },
// ];

const SearchContainer = styled.div`
  display: flex;
`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

type SearchListType = {
  data: SearchResponse;
  params: {};
  query: { page: number; searchTerm: string };
  variables: { page: number; searchTerm: string };
};

export const Search: UniversalComponent<SearchListType> = createUniversalComponent<SearchListType>(
  () => {
    const { status } = useData(Search);
    const { t } = useTranslation();
    const location = useLocation();
    const api = useApi();
    const query = useQuery();
    const preSearch = query.get('fulltext');

    const [results, setResults] = useState([] as any);
    const [searchQuery, setSearchQuery] = useState<string>(preSearch ? preSearch : '');
    const [page, setPage] = useState<number>(1);
    const [totalResults, setTotalResults] = useState<number>(0);
    const [response, setResponse] = useState<SearchResponse | null | void>(null);
    const [totalPages, setTotalPages] = useState<number | undefined>(1);

    useEffect(() => {
      if (response && response.pagination) {
        setResults(response.results);
        setTotalPages(response.pagination.totalPages);
        setTotalResults(response.pagination.totalResults);
        setPage(response.pagination.page);
      }
    }, [response]);

    useEffect(() => {
      const pageNum = query.get('page');
      const searchPage = pageNum ? parseInt(pageNum) : 1;
      async function fetchData() {
        const res = await api.search(searchQuery, searchPage);
        setResponse(res);
      }
      // we don't want to search on an empty string, will just return everything;
      if (searchQuery) fetchData();
    }, [searchQuery, location]);

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
              setSearchQuery(val);
            }}
            value={preSearch ? preSearch : ''}
            totalResults={totalResults}
            searchResults={results}
            sortByFunction={val => {
              alert('you sorted by:  ' + val);
            }}
          />
        </SearchContainer>
        <PaginationNumbered page={page} totalPages={totalPages} stale={false} />
      </>
    );
  },
  {
    getData: async (key, vars, api) => {
      return await api.search(vars.searchTerm, vars.page);
    },
  }
);

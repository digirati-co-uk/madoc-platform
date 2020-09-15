import React, { useState, useEffect } from 'react';
import { SearchFacets } from '../../shared/components/SearchFacets';
import { SearchResults } from '../../shared/components/SearchResults';
import { PaginationNumbered } from '../../shared/components/Pagination';
import { useLocation } from 'react-router-dom';

import { useApi } from '../../shared/hooks/use-api';

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

export const Search: React.FC = () => {
  const [results, setResults] = useState([] as any);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [response, setResponse] = useState<SearchResponse | null | void>(null);
  const [totalPages, setTotalPages] = useState<number | undefined>(1);
  const location = useLocation();
  const api = useApi();

  const query = useQuery();

  useEffect(() => {
    if (response) {
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

    fetchData();
  }, [searchQuery, location]);

  return (
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
};

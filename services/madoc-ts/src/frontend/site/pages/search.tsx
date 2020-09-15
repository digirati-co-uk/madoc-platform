import React, { useState, useEffect } from 'react';
import { SearchFacets } from '../../shared/components/SearchFacets';
import { SearchResults } from '../../shared/components/SearchResults';
import { PaginationNumbered } from '../../shared/components/Pagination';
import { useLocation, useHistory } from 'react-router-dom';

import { useApi } from '../../shared/hooks/use-api';

import styled from 'styled-components';

import searchResults from '../../shared/components/SearchResults.json';

const options = [
  { value: 'Option1', text: 'Option 1' },
  { value: 'Option2', text: 'Option 2' },
  { value: 'Option3', text: 'Option 3' },
];

// const facets = [
//   { name: 'First Facet', options: options },
//   { name: 'Second Facet', options: options },
//   { name: 'Third Facet', options: options },
// ];

const SearchContainer = styled.div`
  display: flex;
`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const Search: React.FC = () => {
  const [results, setResults] = useState([] as any);
  const [searchQuery, setSearchQuery] = useState<string | null>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number | undefined>(1);
  const query = useQuery();
  const search = query.get('search');
  const location = useLocation();
  const api = useApi();

  useEffect(() => {
    setSearchQuery(search);
    setResults(searchResults.results);
    setTotalPages(searchResults.pagination.totalResults);
    setPage(searchResults.pagination.page);
  }, []);

  useEffect(() => {}, [location]);

  return (
    <>
      <SearchContainer>
        {/* <SearchFacets
          facets={searchResults.facets}
          facetChange={(val, facet) => alert('you changed Facet ' + facet + ' to the value ' + val)}
        /> */}
        <SearchResults
          searchFunction={val => {
            api.search(val);
          }}
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

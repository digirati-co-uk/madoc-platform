import React, { useState, useEffect } from 'react';
import { SearchFacets } from '../../shared/components/SearchFacets';
import { SearchResults } from '../../shared/components/SearchResults';
import { PaginationNumbered } from '../../shared/components/Pagination';
import { useLocation } from 'react-router-dom';
// const queryString = require('query-string');

import { useApi } from '../../shared/hooks/use-api';

import styled from 'styled-components';

const options = [
  { value: 'Option1', text: 'Option 1' },
  { value: 'Option2', text: 'Option 2' },
  { value: 'Option3', text: 'Option 3' },
];

const facets = [
  { name: 'First Facet', options: options },
  { name: 'Second Facet', options: options },
  { name: 'Third Facet', options: options },
];

const dummyResults = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      url: 'http://localhost:8000/indexables/1/',
      resource_id: 'https://wellcomelibrary.org/iiif/b18031900-18/manifest',
      content_id: 'https://wellcomelibrary.org/iiif/b18031900-18/contentAsText/0',
      original_content: 'Rhubarb rhubarb blah is a purple sticky fruit.',
      indexable: 'Rhubarb rhubarb blah is a purple sticky fruit.',
      search_vector: "'blah':3A 'fruit':8A 'purpl':6A 'rhubarb':1A,2A 'sticki':7A",
      type: 'other_content',
      language_iso629_2: 'eng',
      language_iso629_1: 'en',
      language_display: 'english',
      language_pg: 'english',
      rank: 1.0,
      snippet: 'Rhubarb rhubarb blah is a purple sticky <b>fruit</b>',
      facets: {
        type: {
          other_content: 1,
        },
        language_display: {
          english: 1,
        },
      },
    },
  ],
};

const SearchContainer = styled.div`
  display: flex;
`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const Search: React.FC = () => {
  const [results, setResults] = useState([] as any);
  const [totalPages, setTotalPages] = useState();
  const query = useQuery();
  const page = query.get('page');

  const api = useApi();

  useEffect(() => {
    setResults(dummyResults.results);
    setTotalPages(dummyResults.count);
  }, []);

  return (
    <>
      <SearchContainer>
        {/* <SearchFacets
          facets={facets}
          facetChange={(val, facet) => alert('you changed Facet ' + facet + ' to the value ' + val)}
        /> */}
        <SearchResults
          searchFunction={val => {
            alert('you searched for:  ' + val);
          }}
          searchResults={results}
          sortByFunction={val => {
            alert('you sorted by:  ' + val);
          }}
        />
      </SearchContainer>
      <PaginationNumbered page={page ? parseInt(page) : 1} totalPages={totalPages} stale={false} />
    </>
  );
};

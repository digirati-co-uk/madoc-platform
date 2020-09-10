import React from 'react';
import { SearchFacets } from '../../shared/components/SearchFacets';
import { SearchResults } from '../../shared/components/SearchResults';
import { PaginationNumbered } from '../../shared/components/Pagination';

import styled from 'styled-components';

// to be removed
import { v4 } from 'uuid';

// CHANGE AS THIS IS WHAT YOU WANT TO CHANGE

const dummyResults = [
  {
    id: v4(),
    title: 'A manifest',
    thumbnail: 'https://via.placeholder.com/150',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat ligula id diam varius pulvinar. Nam ut arcu nisi.',
    type: 'Manifest',
    link: '#',
  },
  {
    id: v4(),
    title: 'A canvas',
    thumbnail: 'https://via.placeholder.com/150',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat ligula id diam varius pulvinar. Nam ut arcu nisi.',
    type: 'Canvas',
    link: '#',
  },
  {
    id: v4(),
    title: 'Another manifest',
    thumbnail: 'https://via.placeholder.com/150',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat ligula id diam varius pulvinar. Nam ut arcu nisi.',
    type: 'Manifest',
    link: '#',
  },
  {
    id: v4(),
    title: 'Another canvas',
    thumbnail: 'https://via.placeholder.com/150',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus placerat ligula id diam varius pulvinar. Nam ut arcu nisi.',
    type: 'Canvas',
    link: '#',
  },
];

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

const SearchContainer = styled.div`
  display: flex;
`;

export const Search: React.FC = () => {
  return (
    <>
      <SearchContainer>
        <SearchFacets
          facets={facets}
          facetChange={(val, facet) => alert('you changed Facet ' + facet + ' to the value ' + val)}
        />
        <SearchResults
          searchFunction={val => {
            alert('you searched for:  ' + val);
          }}
          searchResults={dummyResults}
          sortByFunction={val => {
            alert('you sorted by:  ' + val);
          }}
        />
      </SearchContainer>
      <PaginationNumbered page={2} totalPages={3} stale={false} />
    </>
  );
};

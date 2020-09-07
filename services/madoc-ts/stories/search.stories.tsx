import { MemoryRouter } from 'react-router-dom';
import { Header } from '../src/frontend/shared/components/Header';
import { SearchFacets } from '../src/frontend/shared/components/SearchFacets';
import { SearchResults } from '../src/frontend/shared/components/SearchResults';

import * as React from 'react';
import { text } from '@storybook/addon-knobs';
import { WidePage } from '../src/frontend/shared/atoms/WidePage';
import { GridContainer } from '../src/frontend/shared/atoms/Grid';
import { v4 } from 'uuid';

export default { title: 'Search' };

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

export const HeaderWithBreadcrumbsAndMenuAndSearch = () => (
  <MemoryRouter>
    <Header
      title={text('Site Title', 'Site Title')}
      breadcrumbs={[
        { label: 'Home', link: '#' },
        { label: 'Search', link: '#', active: true },
      ]}
      menu={[
        { label: 'Home', link: '#' },
        { label: 'Collections', link: '#' },
        { label: 'Projects', link: '#', active: true },
        { label: 'Resources', link: '#' },
      ]}
      search={true}
      searchFunction={val => {
        alert('you searched for:  ' + val);
      }}
    />
    <WidePage>
      <GridContainer $justify="space-between">
        <SearchFacets />
        <SearchResults
          searchFunction={val => {
            alert('you searched for:  ' + val);
          }}
          searchResults={dummyResults}
          sortByFunction={val => {
            alert('you sorted by:  ' + val);
          }}
        />
      </GridContainer>
    </WidePage>
  </MemoryRouter>
);

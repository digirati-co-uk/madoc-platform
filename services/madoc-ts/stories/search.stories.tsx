import { MemoryRouter } from 'react-router-dom';
import { Header } from '../src/frontend/shared/components/Header';
import { SearchFacets } from '../src/frontend/shared/components/SearchFacets';
import { SearchResults } from '../src/frontend/shared/components/SearchResults';
import { PaginationNumbered } from '../src/frontend/shared/components/Pagination';

import * as React from 'react';
import { text, number } from '@storybook/addon-knobs';
import { WidePage } from '../src/frontend/shared/atoms/WidePage';
import styled from 'styled-components';

export default { title: 'Search' };

const dummyResults = {
  pagination: {
    page: 2,
    totalPages: 15,
    totalResults: 5,
  },
  results: [
    {
      url: 'http://localhost:8000/api/search/iiif/urn:madoc:manifest:0000004344',
      resource_id: 'urn:madoc:manifest:0000004344',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000004344/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000004344/manifest.json',
      rank: 1.0,
      label: {
        en: [
          'Indigitamenta Deo Optimo-Maximo clementer annuente: Rectore ... Dn. Heinrico X. Juniore, Rutheno, Domino in Graitz, Crannichfeldt, Geraw, Schlaitz & Lobenstein, &c. Pro-Rectore Magnifico Dn. Davide Lindnero, I.U.D. & P.P. &c. Procancellario Eximio Dn. M. Hieronymo Kromayero, SS. Theol. Baccalaureo, Philosophicae Facultatis Adsessore, &c. Decano Spectatissimo Dn. M. Friderico Leibnuetz, Philos. Pract. P. P. & Collegii Maioris Principum p. t. Praeposito',
        ],
      },
      contexts: [
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocmanifest0000004344',
          id: 'urn:madoc:manifest:0000004344',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocsite2',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': 'Indigitamenta Deo Optimo-<b>Maximo</b> clementer annuente: Rectore ... Dn. Heinrico X. Juniore, Rutheno, Domino in Graitz, Crannichfeldt, Geraw, Schlaitz & Lobenstein, &c. Pro-Rectore Magnifico Dn. Davide Lindnero, I.U.D. & P.P. &c. Procancellario Eximio Dn. M. Hieronymo Kromayero, SS. Theol. Baccalaureo, Philosophicae Facultatis Adsessore, &c. Decano Spectatissimo Dn. M. Friderico Leibnuetz, Philos",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Indigitamenta Deo Optimo-Maximo clementer annuente: Rectore ... Dn. Heinrico X. Juniore, Rutheno, Domino in Graitz, Crannichfeldt, Geraw, Schlaitz & Lobenstein, &c. Pro-Rectore Magnifico Dn. Davide Lindnero, I.U.D. & P.P. &c. Procancellario Eximio Dn. M. Hieronymo Kromayero, SS. Theol. Baccalaureo, Philosophicae Facultatis Adsessore, &c. Decano Spectatissimo Dn. M. Friderico Leibnuetz, Philos. Pract. P. P. & Collegii Maioris Principum p. t. Praeposito'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/api/search/iiif/urn:madoc:manifest:0000012003',
      resource_id: 'urn:madoc:manifest:0000012003',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000012003/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000012003/manifest.json',
      rank: 1.0,
      label: {
        en: ['Philosophia Triplex Rationalis, Naturalis & Suprema'],
      },
      contexts: [
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocmanifest0000012003',
          id: 'urn:madoc:manifest:0000012003',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocsite2',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'metadata',
          subtype: 'author',
          snippet: "Author': 'Steiner, <b>Maximo</b>",
          language: 'en',
          rank: 1.0,
          original_content: "{'Author': 'Steiner, Maximo'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/api/search/iiif/urn:madoc:manifest:0000004389',
      resource_id: 'urn:madoc:manifest:0000004389',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000004389/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000004389/manifest.json',
      rank: 1.0,
      label: {
        en: [
          'Deo Sapientiae Et Bonarum Artium Autori Optimo Conservatori Maximo Et Memoriae Honoris In Philosophia Summi Iuvenum Optimorum Doctissimorumque Numero XXV. Sacrum Rectore ... Godofredo Welschio, Phil. & Med. D. Fac. Med. Seniore, Pathol. P.P. Celeberr. Mai. Princ. Colleg. Collegiato, Acad. Decemv. & Reip. Patriae Physico undiquaq[ue] Dignissimo, Procancellario ... Friderico Rappolto, SS. Theol. Licentiato, Poes. P.P. Famigeratissimo, Mai. Princip. Colleg. Collegiato & h.t. Praeposito, Paedag. ad. D. Nicol. Rectore undiquaq[ue] Meritissimo, Decano ... M. Valentino Alberti, Log. & Metaph. P.P. Celeberrimo, Colleg. Mariani Collegiato Dignissimo',
        ],
      },
      contexts: [
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocmanifest0000004389',
          id: 'urn:madoc:manifest:0000004389',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocsite2',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': 'Deo Sapientiae Et Bonarum Artium Autori Optimo Conservatori <b>Maximo</b> Et Memoriae Honoris In Philosophia Summi Iuvenum Optimorum Doctissimorumque Numero XXV. Sacrum Rectore ... Godofredo Welschio, Phil. & Med. D. Fac. Med. Seniore, Pathol. P.P. Celeberr. Mai. Princ. Colleg. Collegiato, Acad. Decemv. & Reip. Patriae Physico undiquaq[ue] Dignissimo, Procancellario ... Friderico Rappolto",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Deo Sapientiae Et Bonarum Artium Autori Optimo Conservatori Maximo Et Memoriae Honoris In Philosophia Summi Iuvenum Optimorum Doctissimorumque Numero XXV. Sacrum Rectore ... Godofredo Welschio, Phil. & Med. D. Fac. Med. Seniore, Pathol. P.P. Celeberr. Mai. Princ. Colleg. Collegiato, Acad. Decemv. & Reip. Patriae Physico undiquaq[ue] Dignissimo, Procancellario ... Friderico Rappolto, SS. Theol. Licentiato, Poes. P.P. Famigeratissimo, Mai. Princip. Colleg. Collegiato & h.t. Praeposito, Paedag. ad. D. Nicol. Rectore undiquaq[ue] Meritissimo, Decano ... M. Valentino Alberti, Log. & Metaph. P.P. Celeberrimo, Colleg. Mariani Collegiato Dignissimo'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/api/search/iiif/urn:madoc:manifest:0000001126',
      resource_id: 'urn:madoc:manifest:0000001126',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000001126/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000001126/manifest.json',
      rank: 1.0,
      label: {
        en: [
          'Analysis Philologo-Theologica Verborum Evangelii Johannis, Cap. I. v. 29. & 36. De Agno Illo Dei Jesu Christo, tollente peccatum Mundi, tanquam Sacerdote nostro Summo & Pontifice maximo Unico',
        ],
      },
      contexts: [
        {
          url: 'http://localhost:8000/api/search/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocmanifest0000001126',
          id: 'urn:madoc:manifest:0000001126',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocsite2',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            'Philologo-Theologica Verborum Evangelii Johannis, Cap. I. v. 29. & 36. De Agno Illo Dei Jesu Christo, tollente peccatum Mundi, tanquam Sacerdote nostro Summo & Pontifice <b>maximo</b> Unico',
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Analysis Philologo-Theologica Verborum Evangelii Johannis, Cap. I. v. 29. & 36. De Agno Illo Dei Jesu Christo, tollente peccatum Mundi, tanquam Sacerdote nostro Summo & Pontifice maximo Unico'}",
        },
      ],
    },
    {
      url: 'http://localhost:8000/api/search/iiif/urn:madoc:manifest:0000000924',
      resource_id: 'urn:madoc:manifest:0000000924',
      resource_type: 'Manifest',
      madoc_thumbnail: 'http://madoc.foo/thumbnail/0000000924/fake.jpg',
      id: 'https://iiif.ub.uni-leipzig.de/0000000924/manifest.json',
      rank: 1.0,
      label: {
        en: [
          'Decanus Communitatis Studii Bonarum Artium Et Philosophiæ In Academia Lipsiensi Ad audiendam XIV. April. Vigiliâ Paschatis, Orationem De Sepulchro Christi minimo maximo, Lectorem Benevolum Humanißimè invitat.',
        ],
      },
      contexts: [
        {
          url: 'http://localhost:8000/api/search/contexts/httpsiiifubuni-leipzigdestaticcollectionsdrucke17c',
          id: 'https://iiif.ub.uni-leipzig.de/static/collections/Drucke17/collection.json',
          type: 'Collection',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocmanifest0000000924',
          id: 'urn:madoc:manifest:0000000924',
          type: 'Manifest',
        },
        {
          url: 'http://localhost:8000/api/search/contexts/urnmadocsite2',
          id: 'urn:madoc:site:2',
          type: 'Site',
        },
      ],
      hits: [
        {
          type: 'descriptive',
          subtype: 'label',
          snippet:
            "label': 'Decanus Communitatis Studii Bonarum Artium Et Philosophiæ In Academia Lipsiensi Ad audiendam XIV. April. Vigiliâ Paschatis, Orationem De Sepulchro Christi minimo <b>maximo</b>, Lectorem Benevolum Humanißimè invitat",
          language: 'en',
          rank: 1.0,
          original_content:
            "{'label': 'Decanus Communitatis Studii Bonarum Artium Et Philosophiæ In Academia Lipsiensi Ad audiendam XIV. April. Vigiliâ Paschatis, Orationem De Sepulchro Christi minimo maximo, Lectorem Benevolum Humanißimè invitat.'}",
        },
      ],
    },
  ],
  facets: {
    metadata: {
      author: {
        '': 1,
        'Ittig, Thomas': 1,
        'Steiner, Maximo': 1,
        'Strauch, Johann': 1,
        'Wettstein, Johann Rudolf': 1,
      },
      'call number': {
        'Philos.8-m': 1,
        'Syst.Theol.601/33': 1,
        'Univ.37-o/18': 1,
        'Univ.380-a/28': 1,
        'Univ.380-a/4': 1,
      },
      collection: {
        VD17: 5,
        'Drucke des 17. Jahrhunderts': 1,
      },
      'date of publication': {
        '1642': 1,
        '1645': 1,
        '1665': 1,
        '1666': 1,
        '1683': 1,
      },
      kitodo: {
        '13373': 1,
        '1397': 1,
        '3268': 1,
        '3283': 1,
        '935': 1,
      },
      'manifest type': {
        monograph: 5,
      },
      owner: {
        'Leipzig University Library': 5,
      },
      'physical description': {
        '[11] Bl.': 1,
        '[14] Bl': 1,
        '[20] Bl.': 1,
        '4 ungezählte Seiten': 1,
        '4 ungezählte Seiten, 36 Seiten': 1,
      },
      'place of publication': {
        Lipsiae: 2,
        Basileae: 1,
        Herbipoli: 1,
        Lipsiæ: 1,
      },
      publisher: {
        Bertschius: 1,
        'Ex Officina Typographica Henrici Pigrini': 1,
        Lanckisch: 1,
        'Literis Ritzschianis': 1,
        'Typis Viduae Henningi Coleri': 1,
      },
      related: {
        "{'en': ['Attribution']}": 5,
      },
      'source ppn (swb)': {
        '055724892': 1,
        '055747612': 1,
        '062644092': 1,
        '488659248': 1,
        '489648320': 1,
      },
      urn: {
        'urn:nbn:de:bsz:15-0008-105789': 1,
        'urn:nbn:de:bsz:15-0008-110307': 1,
        'urn:nbn:de:bsz:15-0008-129802': 1,
        'urn:nbn:de:bsz:15-0008-129954': 1,
        'urn:nbn:de:bsz:15-0008-230062': 1,
      },
      vd17: {
        'VD17 125:024313B': 1,
        'VD17 125:031523K': 1,
        'VD17 15:739988H': 1,
        'VD17 15:743856V': 1,
        'VD17 7:710498S': 1,
      },
    },
  },
};

const sortByOptions = [
  { value: 'Option1', text: 'Option 1' },
  { value: 'Option2', text: 'Option 2' },
  { value: 'Option3', text: 'Option 3' },
];

const SearchContainer = styled.div`
  display: flex;
`;

const mapFacets = facets => {
  const options = [];
  for (const [key, value] of Object.entries(facets)) {
    const subtype = key;
    for (const [k] of Object.entries(value)) {
      options.push({
        type: 'metadata',
        subtype: subtype,
        value: k,
      });
    }
  }
  return options;
};

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
      <SearchContainer>
        <SearchFacets
          facets={mapFacets(dummyResults.facets.metadata)}
          facetChange={(facet, val) => alert('you changed Facet ' + facet + ' to the value ' + val)}
        />
        <SearchResults
          searchFunction={val => {
            alert('you searched for:  ' + val);
          }}
          totalResults={dummyResults.pagination.totalResults}
          searchResults={dummyResults.results}
          sortByFunction={val => {
            alert('you sorted by:  ' + val);
          }}
        />
      </SearchContainer>
      <PaginationNumbered
        page={number('Page Number', dummyResults.pagination.page)}
        totalPages={number('Total Pages', dummyResults.pagination.totalPages)}
        stale={false}
      />
    </WidePage>
  </MemoryRouter>
);

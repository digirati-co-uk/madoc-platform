import React from 'react';
import styled from 'styled-components';

import { Dropdown } from '@capture-models/editor';
import { SearchFacet } from '../../../types/schemas/search';

const FacetsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-right: 1rem;
`;

const FacetLabel = styled.div`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const FacetContainer = styled.div`
  padding: 1rem 0.5rem;
`;
export const SearchFacets: React.FC<{
  facets: Array<SearchFacet>;
  facetChange: (val: string | undefined, name: string) => void;
}> = ({ facets, facetChange }) => {
  return (
    <FacetsContainer>
      <FacetLabel>filter by</FacetLabel>
      {facets.map(facet => (
        <FacetContainer key={facet.name}>
          <Dropdown options={facet.options} placeholder={facet.name} onChange={val => facetChange(val, facet.name)} />
        </FacetContainer>
      ))}
    </FacetsContainer>
  );
};

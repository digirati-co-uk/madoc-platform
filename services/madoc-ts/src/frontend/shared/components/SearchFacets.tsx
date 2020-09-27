import React from 'react';
import styled from 'styled-components';

// import { Dropdown } from '@capture-models/editor';
import { SearchFacet } from '../../../types/schemas/search';

const FacetsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  margin-right: 1rem;
`;

const FacetLabel = styled.label`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const FacetType = styled.div`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 1rem 0.5rem;
`;

const FacetTitle = styled.div`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
`;

export const SearchFacets: React.FC<{
  facets: Array<SearchFacet>;
  facetChange: (val: string | undefined, name: string) => void;
}> = ({ facets, facetChange }) => {
  return (
    <FacetsContainer>
      <FacetTitle>filter by</FacetTitle>
      {facets.map((facet, idx) => {
        return (
          <>
            <FacetType>{facet[0]}</FacetType>
            {Object.entries(facet[1]).map(option => {
              return (
                <FacetLabel htmlFor="" key={option[0]}>
                  <input type="checkbox" value={option[0]} onChange={val => facetChange(facet[0], val.target.value)} />
                  {option[0]}
                </FacetLabel>
              );
            })}
          </>
        );
      })}
    </FacetsContainer>
  );
};

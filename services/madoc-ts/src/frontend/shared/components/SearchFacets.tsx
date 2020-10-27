import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { SearchFacet } from '../../../types/search';
import { Button, ButtonRow } from '../atoms/Button';

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
  text-transform: capitalize;
  max-width: 10rem;
`;

const FacetType = styled.div`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
`;

const FacetTitle = styled.div`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const FacetExpandable: React.FC<{
  name: string;
  facetChange: (val: string, name: string) => void;
  values: Array<any>;
}> = ({ name, facetChange, values }) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <FacetType onClick={() => setOpen(!open)}>
        {name}
        <DownArrowIcon style={open ? { transform: 'rotate(180deg)' } : {}} />
      </FacetType>
      {open
        ? values.map(option => {
            return (
              <FacetLabel htmlFor={`facet__${name}__${option.value}`} key={`facet__${name}__${option.value}`}>
                <input
                  key={`facet__${name}__${option.value}__${option.applied}`}
                  id={`facet__${name}__${option.value}`}
                  type="checkbox"
                  value={option.value}
                  onChange={val => {
                    facetChange(name, val.target.value);
                  }}
                  defaultChecked={option.applied}
                />
                {option.value}
              </FacetLabel>
            );
          })
        : null}
    </>
  );
};

export const SearchFacets: React.FC<{
  facets: SearchFacet[];
  facetChange: (name: string, val: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}> = ({ facets, facetChange, applyFilters, clearFilters }) => {
  const groups = [...new Set(facets.map(facet => facet.subtype))];
  return (
    <FacetsContainer>
      <FacetTitle>filter by</FacetTitle>
      <ButtonRow>
        <Button onClick={() => applyFilters()}>Apply Filters</Button>
        <Button onClick={() => clearFilters()}>Clear Filters</Button>
      </ButtonRow>

      {groups.map(groupType => {
        return (
          <FacetExpandable
            key={groupType}
            name={groupType}
            facetChange={facetChange}
            values={facets.filter(facet => facet.subtype === groupType)}
          />
        );
      })}
    </FacetsContainer>
  );
};

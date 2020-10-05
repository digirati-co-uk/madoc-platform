import React, { useState } from 'react';
import styled from 'styled-components';

// import { Dropdown } from '@capture-models/editor';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { SearchFacet } from '../../../types/search';

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
`;

const FacetType = styled.div`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 1rem 0rem;
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
        <DownArrowIcon style={!open ? { transform: 'rotate(180deg)' } : {}} />
      </FacetType>
      {open
        ? values.map(option => {
            return (
              <FacetLabel htmlFor="" key={option.value}>
                <input
                  type="checkbox"
                  value={option.value}
                  onChange={val => facetChange(name, val.target.value)}
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
}> = ({ facets, facetChange }) => {
  const groups = [...new Set(facets.map(facet => facet.subtype))];
  return (
    <FacetsContainer>
      <FacetTitle>filter by</FacetTitle>
      {groups.map(groupType => {
        return (
          <>
            <FacetExpandable
              name={groupType}
              facetChange={facetChange}
              values={facets.filter(facet => facet.subtype === groupType)}
            />
          </>
        );
      })}
    </FacetsContainer>
  );
};

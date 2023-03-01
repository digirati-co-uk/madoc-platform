import React from 'react';
import styled from 'styled-components';
import { useSearchQuery } from '../hooks/use-search-query';
import { useSearchFacets } from '../hooks/use-search-facets';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CloseIcon } from '../../shared/icons/CloseIcon';

export const AppliedFacetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 1em 0;
`;

export const Pill = styled.div`
  border-radius: 3px;
  width: auto;
  background-color: #ecf0ff;
  color: #437bdd;
  margin-right: 1em;
  font-size: 12px;
  padding: 5px;
`;

export const RemoveFacet = styled.button`
  background-color: transparent;
  border: none;
  color: #0a2450;
  cursor: pointer;
  border-radius: 50px;
  margin: 2px;

  svg {
    height: 16px;
    width: 16px;
    vertical-align: middle;
  }

  :hover {
    background-color: rgba(0, 0, 0, 0.1);
    transition: background-color ease-in-out 0.3s;
  }
`;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppliedFacetsProps {}

export const AppliedFacets: React.FC<AppliedFacetsProps> = () => {
  const { fulltext, appliedFacets } = useSearchQuery();
  const { clearSingleFacet } = useSearchFacets();

  if (!appliedFacets || appliedFacets.length < 1) {
    return null;
  }
  return (
    <AppliedFacetContainer>
      {appliedFacets.map((facet, i) => (
        <Pill key={i}>
          {facet.v}
          <RemoveFacet
            onClick={() => {
              clearSingleFacet(facet.k, [facet.v]);
            }}
          >
            <CloseIcon />
          </RemoveFacet>
        </Pill>
      ))}
    </AppliedFacetContainer>
  );
};

blockEditorFor(AppliedFacets, {
  label: 'Applied Facets',
  type: 'default.applied-facets',
  anyContext: [],
  requiredContext: ['page'],
  editor: {},
});

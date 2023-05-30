import React from 'react';
import styled from 'styled-components';
import { useSearchQuery } from '../hooks/use-search-query';
import { useSearchFacets } from '../hooks/use-search-facets';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CloseIcon } from '../../shared/icons/CloseIcon';

export const AppliedFacetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  //padding: 1em 0;
`;

export const Pill = styled.div`
  border-radius: 3px;
  background-color: #ecf0ff;
  color: #437bdd;
  display: flex;
  padding: 5px;
  margin: 0 1em 1em 0;
  max-width: 250px;
  transition: max-width ease-in-out 0.6s;
  :hover {
    transition: max-width ease-in-out 0.6s;
    cursor: pointer;
    max-width: 100%;
  }
`;
export const FacetLabel = styled.p`
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  padding: 5px;
  margin: 0;
  :hover {
    cursor: pointer;
  }
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
          <FacetLabel>{facet.v}</FacetLabel>
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
  anyContext: ['collection', 'manifest', 'canvas', 'project', 'topic', 'topicType'],
  requiredContext: ['page'],
  editor: {},
});

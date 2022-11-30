import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  SearchFilterContainer,
  SearchFilterItem,
  SearchFilterItemList,
  SearchFilterLabel,
  SearchFilterSection,
  SearchFilterSectionTitle,
  SearchFilterTitle,
} from '../../shared/components/SearchFilters';
import { ButtonRow, TinyButton } from '../../shared/navigation/Button';
import { LocaleString } from '../../shared/components/LocaleString';
import { useSearchQuery } from '../hooks/use-search-query';
import { useSearchFacets } from '../hooks/use-search-facets';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { InternationalString } from '@iiif/presentation-3';
import { CheckboxBtn } from '../../shared/atoms/CheckboxBtn';
import { useSearch } from '../hooks/use-search';
import { CloseIcon } from "../../shared/icons/CloseIcon";

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
interface SearchPageFiltersProps {
  facetColor?: string;
}

export const AppliedFacets: React.FC<SearchPageFiltersProps> = ({ facetColor }) => {
  const { t } = useTranslation();
  const { fulltext, appliedFacets } = useSearchQuery();
  const { clearSingleFacet } = useSearchFacets();

  return (
    <AppliedFacetContainer>
      {appliedFacets.length > 0 &&
        appliedFacets.map((facet, i) => (
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
  type: 'default.appliedF-facets',
  anyContext: [],
  requiredContext: [],
  defaultProps: {
    pillColor: '',
  },
  editor: {
    pillColor: { label: 'facet color', type: 'color-field' },
  },
});

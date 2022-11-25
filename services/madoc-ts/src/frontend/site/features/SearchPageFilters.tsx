import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  SearchFilterCheckbox,
  SearchFilterContainer,
  SearchFilterItem,
  SearchFilterItemCount,
  SearchFilterItemList,
  SearchFilterLabel,
  SearchFilterSection,
  SearchFilterSectionTitle,
  SearchFilterTitle,
  SearchFilterToggle,
} from '../../shared/components/SearchFilters';
import { SearchBox } from '../../shared/atoms/SearchBox';
import { ButtonRow, TinyButton } from '../../shared/navigation/Button';
import { LocaleString } from '../../shared/components/LocaleString';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { AddIcon } from '../../shared/icons/AddIcon';
import { useSearchQuery } from '../hooks/use-search-query';
import { useSiteConfiguration } from './SiteConfigurationContext';
import { useSearchFacets } from '../hooks/use-search-facets';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { InternationalString } from '@iiif/presentation-3';
import { FacetConfigValue } from '../../shared/components/MetadataFacetEditor';
import { CheckboxField } from '../../shared/capture-models/editor/input-types/CheckboxField/CheckboxField';
import { CheckboxBtn } from '../../shared/atoms/CheckboxBtn';

export const Pill = styled.div`
  border-radius: 3px;
  width: auto;
  background-color: #ecf0ff;
  color: #437bdd;
  margin-right: 1em;
  font-size: 12px;
  padding: 5px;
`;

interface SearchPageFilters {
  background?: string;
  textColor?: string;
  displayFacets?: {
    id: string;
    label: InternationalString;
    items: FacetConfigValue[];
  }[];
}

export function SearchPageFilters(props: SearchPageFilters) {
  const { t } = useTranslation();
  const displayFacets = props.displayFacets;
  const { fulltext, appliedFacets } = useSearchQuery();
  const {
    project: { showSearchFacetCount },
  } = useSiteConfiguration();
  const {
    inQueue,
    applyFacet,
    clearSingleFacet,
    queueSingleFacet,
    dequeueSingleFacet,
    isFacetSelected,
    applyAllFacets,
    clearAllFacets,
    setFullTextQuery,
  } = useSearchFacets();

  if (!props.displayFacets) {
    return null;
  }
  return (
    <SearchFilterContainer>
      <SearchFilterTitle>{t('Refine search')}</SearchFilterTitle>
      {/*<SearchBox onSearch={setFullTextQuery} placeholder="Keywords" value={fulltext} />*/}
      <ButtonRow>
        <TinyButton disabled={!inQueue} onClick={() => applyAllFacets()}>
          {t('Apply')}
        </TinyButton>
        <TinyButton disabled={!appliedFacets.length} onClick={() => clearAllFacets()}>
          {t('Clear')}
        </TinyButton>
      </ButtonRow>
      {displayFacets?.map(facet => {
        if (facet.items.length === 0) {
          return null;
        }
        return (
          <SearchFilterSection key={facet.id}>
            <SearchFilterSectionTitle>
              <LocaleString style={{ textTransform: 'capitalize' }}>{facet.label}</LocaleString>
            </SearchFilterSectionTitle>
            <SearchFilterItemList>
              {facet.items.map(item => {
                const isSelected = isFacetSelected(item.key, item.values);
                const itemHash = `item__${facet.id}::${item.key}::${item.values}`;

                return (
                  <SearchFilterItem key={item.values.join(',')} $selected={!!isSelected}>
                    <CheckboxBtn
                      id={itemHash}
                      checked={isSelected !== 0}
                      onChange={(e: { target: { checked: any } }) =>
                        e.target.checked
                          ? queueSingleFacet(item.key, item.values)
                          : dequeueSingleFacet(item.key, item.values)
                      }
                    />
                    <SearchFilterLabel htmlFor={itemHash}>
                      <LocaleString>{item.label}</LocaleString>
                    </SearchFilterLabel>
                  </SearchFilterItem>
                );
              })}
            </SearchFilterItemList>
          </SearchFilterSection>
        );
      })}
    </SearchFilterContainer>
  );
}

blockEditorFor(SearchPageFilters, {
  label: 'Search Page Filters',
  type: 'search-page-filters',
  defaultProps: {},
  editor: {},
});

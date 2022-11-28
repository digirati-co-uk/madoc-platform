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

export const Pill = styled.div`
  border-radius: 3px;
  width: auto;
  background-color: #ecf0ff;
  color: #437bdd;
  margin-right: 1em;
  font-size: 12px;
  padding: 5px;
`;

interface SearchPageFiltersProps {
  checkBoxColor?: string;
  textTest?: string;
  displayFacets?: {
    id: string;
    label: InternationalString;
    items: { key: string; label: InternationalString; values: string[]; count: number }[];
  }[];
}

export const SearchPageFilters: React.FC<SearchPageFiltersProps> = ({ checkBoxColor, displayFacets, textTest }) => {
  const { t } = useTranslation();
  const { fulltext, appliedFacets } = useSearchQuery();
  const {
    inQueue,
    queueSingleFacet,
    dequeueSingleFacet,
    isFacetSelected,
    applyAllFacets,
    clearAllFacets,
  } = useSearchFacets();

  if (!displayFacets) {
    return null;
  }
  console.log(textTest);
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
                      color={checkBoxColor}
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
};

blockEditorFor(SearchPageFilters, {
  label: 'Search Page Filters',
  type: 'search-page-filters',
  anyContext: [],
  requiredContext: [],
  defaultProps: {
    checkBoxColor: '',
    textTest: '',
  },
  editor: {
    checkBoxColor: { label: 'Check box color', type: 'color-field' },
    textTest: { label: 'Test for props', type: 'text-field' },
  },
});

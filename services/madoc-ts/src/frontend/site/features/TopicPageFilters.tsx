import React from 'react';
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
import { CheckboxBtn } from '../../shared/atoms/CheckboxBtn';
import { useSearch } from '../hooks/use-search';
import { SearchBox } from '../../shared/atoms/SearchBox';
import { Accordion } from '../../shared/atoms/Accordion';
import {useParams} from "react-router-dom";
import {useTopicItems} from "../../shared/hooks/use-topic-items";

interface TopicPageFilters {
  checkBoxColor?: string;
  filterHeader?: string;
}

export const TopicPageFilters: React.FC<TopicPageFilters> = ({ checkBoxColor, filterHeader }) => {
    const { topic } = useParams<Record<'topic', any>>();
    const [{ data, isLoading, latestData }, { query, page }] = useTopicItems(topic);


  const { t } = useTranslation();
  const { appliedFacets, fulltext } = useSearchQuery();
  const {
    inQueue,
    queueSingleFacet,
    dequeueSingleFacet,
    isFacetSelected,
    applyAllFacets,
    clearAllFacets,
    setFullTextQuery,
  } = useSearchFacets();

  return (
    <SearchFilterContainer>
      <SearchFilterTitle>{filterHeader}</SearchFilterTitle>

      <SearchBox onSearch={setFullTextQuery} placeholder="Keywords" value={fulltext} />

      <ButtonRow>
        <TinyButton disabled={!inQueue} onClick={() => applyAllFacets()}>
          {t('Apply')}
        </TinyButton>
        <TinyButton disabled={!appliedFacets.length} onClick={() => clearAllFacets()}>
          {t('Clear')}
        </TinyButton>
      </ButtonRow>

      {latestData?.facets?.map(facet => {
        if (facet.items.length === 0) {
          return null;
        }
        return (
          <Accordion key={facet.id} title={facet.label}>
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
          </Accordion>
        );
      })}
    </SearchFilterContainer>
  );
};

blockEditorFor(TopicPageFilters, {
  label: 'Topic Page Filters',
  type: 'default.TopicPageFilters',
  anyContext: ['topic'],
  requiredContext: [],
  defaultProps: {
    checkBoxColor: '',
    filterHeader: 'Refine search',
  },
  editor: {
    checkBoxColor: { label: 'Check box color', type: 'color-field' },
    filterHeader: { label: 'filter header', type: 'text-field' },
  },
});

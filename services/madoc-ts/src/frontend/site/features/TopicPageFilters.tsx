import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  SearchFilterContainer,
  SearchFilterItem,
  SearchFilterItemCount,
  SearchFilterItemList,
  SearchFilterLabel,
  SearchFilterTitle,
} from '../../shared/components/SearchFilters';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { LocaleString } from '../../shared/components/LocaleString';
import { useSearchQuery } from '../hooks/use-search-query';
import { useSearchFacets } from '../hooks/use-search-facets';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CheckboxBtn } from '../../shared/atoms/CheckboxBtn';
import { Accordion } from '../../shared/atoms/Accordion';
import { Spinner } from '../../shared/icons/Spinner';
import { EmptyState } from '../../shared/layout/EmptyState';
import { useTopicSearch } from '../hooks/use-topic-search';

interface TopicPageFiltersProps {
  checkBoxColor?: string;
  filterHeader?: string;
}

export const TopicPageFilters: React.FC<TopicPageFiltersProps> = ({ checkBoxColor, filterHeader }) => {
  const [{ resolvedData: searchResponse, latestData }, displayFacets, isLoading] = useTopicSearch();
  const { t } = useTranslation();
  const { appliedFacets, fulltext, rscType } = useSearchQuery();

  const {
    inQueue,
    queueSingleFacet,
    dequeueSingleFacet,
    isFacetSelected,
    applyAllFacets,
    clearAllFacets,
  } = useSearchFacets();

  const uniqueFacets = [...new Map(displayFacets.map(v => [v.id, v])).values()];

  if (!uniqueFacets) {
    return null;
  }
  if (isLoading) {
    return (
      <EmptyState style={{ width: '200px' }}>
        <Spinner stroke="#000" />
      </EmptyState>
    );
  }
  return (
    <SearchFilterContainer>
      <SearchFilterTitle>{filterHeader}</SearchFilterTitle>

      <ButtonRow $noMargin>
        <Button $primary disabled={!inQueue} onClick={() => applyAllFacets()}>
          {t('Apply filters')}
        </Button>
        <Button disabled={!appliedFacets.length} onClick={() => clearAllFacets()}>
          {t('Clear')}
        </Button>
      </ButtonRow>

      {uniqueFacets?.map(facet => {
        if (facet.items.length === 0) {
          return null;
        }
        return (
          <Accordion key={facet.id} title={facet.label} defaultOpen={appliedFacets.some(f => f.k === facet.id)}>
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
                          ? queueSingleFacet(item.key, item.values, item.type)
                          : dequeueSingleFacet(item.key, item.values, item.type)
                      }
                    />
                    <SearchFilterLabel htmlFor={itemHash}>
                      <LocaleString>{item.label}</LocaleString>
                    </SearchFilterLabel>
                    <SearchFilterItemCount>({item.count})</SearchFilterItemCount>
                  </SearchFilterItem>
                );
              })}
            </SearchFilterItemList>
          </Accordion>
        );
      })}
      <ButtonRow $noMargin>
        <Button $primary disabled={!inQueue} onClick={() => applyAllFacets()}>
          {t('Apply filters')}
        </Button>
        <Button disabled={!appliedFacets.length} onClick={() => clearAllFacets()}>
          {t('Clear')}
        </Button>
      </ButtonRow>
    </SearchFilterContainer>
  );
};

blockEditorFor(TopicPageFilters, {
  label: 'Topic Page Filters',
  type: 'default.TopicPageFilters',
  anyContext: ['collection', 'manifest', 'canvas', 'project', 'topic', 'topicType'],
  requiredContext: ['page'],
  defaultProps: {
    checkBoxColor: '',
    filterHeader: 'Refine search',
  },
  editor: {
    checkBoxColor: { label: 'Check box color', type: 'color-field' },
    filterHeader: { label: 'filter header', type: 'text-field' },
  },
});

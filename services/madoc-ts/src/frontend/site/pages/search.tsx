import React from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '../../shared/atoms/CloseIcon';
import { LoadingBlock } from '../../shared/atoms/LoadingBlock';
import { SearchBox } from '../../shared/atoms/SearchBox';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Pagination } from '../../shared/components/Pagination';
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
import { SearchResults, TotalResults } from '../../shared/components/SearchResults';
import { AddIcon } from '../../shared/icons/AddIcon';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useSearch } from '../hooks/use-search';
import { useSearchFacets } from '../hooks/use-search-facets';
import { useSearchQuery } from '../hooks/use-search-query';
import { ButtonRow, TinyButton } from '../../shared/atoms/Button';

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const [{ resolvedData: searchResponse, latestData }, displayFacets, isLoading] = useSearch();
  const { rawQuery, page, fulltext, appliedFacets } = useSearchQuery();
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

  return (
    <>
      <DisplayBreadcrumbs currentPage="Search" />
      <div style={{ display: 'flex' }}>
        <SearchFilterContainer style={{ width: 300 }}>
          <SearchFilterTitle>{t('Refine search')}</SearchFilterTitle>
          <SearchBox onSearch={setFullTextQuery} placeholder="Keywords" value={fulltext} />
          <ButtonRow>
            <TinyButton disabled={!inQueue} onClick={() => applyAllFacets()}>
              {t('Apply')}
            </TinyButton>
            <TinyButton disabled={!appliedFacets.length} onClick={() => clearAllFacets()}>
              {t('Clear')}
            </TinyButton>
          </ButtonRow>
          {displayFacets.map(facet => {
            if (facet.items.length === 0) {
              return null;
            }
            return (
              <SearchFilterSection key={facet.id}>
                <SearchFilterSectionTitle>
                  <LocaleString>{facet.label}</LocaleString>
                </SearchFilterSectionTitle>
                <SearchFilterItemList>
                  {facet.items.map(item => {
                    const isSelected = isFacetSelected(item.key, item.values);
                    const itemHash = `item__${facet.id}::${item.key}::${item.values}`;
                    return (
                      <SearchFilterItem key={item.values.join(',')} $selected={!!isSelected}>
                        <SearchFilterCheckbox>
                          <input
                            type="checkbox"
                            id={itemHash}
                            checked={isSelected !== 0}
                            onChange={e =>
                              e.target.checked
                                ? queueSingleFacet(item.key, item.values)
                                : dequeueSingleFacet(item.key, item.values)
                            }
                          />
                        </SearchFilterCheckbox>
                        <SearchFilterLabel htmlFor={itemHash}>
                          <LocaleString>{item.label}</LocaleString>
                        </SearchFilterLabel>
                        {showSearchFacetCount ? (
                          <SearchFilterItemCount>
                            {t('{{count}} manifests', { count: item.count })}
                          </SearchFilterItemCount>
                        ) : null}
                        {isSelected !== 0 ? (
                          <SearchFilterToggle onClick={() => clearSingleFacet(item.key, item.values)}>
                            <CloseIcon $solid width={12} height={12} />
                          </SearchFilterToggle>
                        ) : (
                          <SearchFilterToggle onClick={() => applyFacet(item.key, item.values)}>
                            <AddIcon height={12} width={12} />
                          </SearchFilterToggle>
                        )}
                      </SearchFilterItem>
                    );
                  })}
                </SearchFilterItemList>
              </SearchFilterSection>
            );
          })}
        </SearchFilterContainer>
        <div style={{ flex: '1 1 0px' }}>
          {isLoading && !searchResponse ? (
            <LoadingBlock />
          ) : (
            <TotalResults>
              {t('Found {{count}} results', {
                count: searchResponse && searchResponse.pagination ? searchResponse.pagination.totalResults : 0,
              })}
            </TotalResults>
          )}
          <Pagination
            page={page}
            totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
            stale={isLoading}
            extraQuery={rawQuery}
          />
          <SearchResults
            isFetching={isLoading}
            value={fulltext}
            searchResults={searchResponse ? searchResponse.results : []}
          />
          <Pagination
            page={page}
            totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
            stale={isLoading}
            extraQuery={rawQuery}
          />
        </div>
      </div>
    </>
  );
};

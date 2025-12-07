import React from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { SearchBox } from '../../shared/atoms/SearchBox';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
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
import { SearchResults, TotalResults } from '../features/search/SearchResults';
import { AddIcon } from '../../shared/icons/AddIcon';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { useSearch } from '../hooks/use-search';
import { useSearchFacets } from '../hooks/use-search-facets';
import { useSearchQuery } from '../hooks/use-search-query';
import { ButtonRow, TinyButton } from '../../shared/navigation/Button';

export const Search: React.FC = () => {
  const { t, i18n } = useTranslation();
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

  // Helper function to get label in current language only
  const getLocalizedLabel = (label: any) => {
    if (!label) {
      return label;
    }

    // If it's already a string, return it as-is
    if (typeof label === 'string') {
      return label;
    }

    // Handle InternationalString objects
    if (typeof label === 'object') {
      const availableLanguages = Object.keys(label);

      // Priority 1: Exact match for current language
      if (label[i18n.language] && Array.isArray(label[i18n.language])) {
        return { [i18n.language]: label[i18n.language] };
      }

      // Priority 2: Short language code (e.g., 'en' from 'en-US')
      const currentLangShort = i18n.language.split('-')[0];
      if (label[currentLangShort] && Array.isArray(label[currentLangShort])) {
        return { [currentLangShort]: label[currentLangShort] };
      }

      // Priority 3: If we have multiple languages and one is 'none', try to find a real language
      if (availableLanguages.length > 1 && availableLanguages.includes('none')) {
        // Look for English first as a fallback
        if (label['en'] && Array.isArray(label['en'])) {
          return { en: label['en'] };
        }

        // Then look for any non-'none' language
        const realLang = availableLanguages.find(lang => lang !== 'none' && lang !== '@none');
        if (realLang && label[realLang] && Array.isArray(label[realLang])) {
          return { [realLang]: label[realLang] };
        }
      }

      // Priority 4: Handle 'none' language values - just pass through
      // The script-based filtering is now done in use-search.ts
      if (label['none'] && Array.isArray(label['none'])) {
        return label;
      }

      // Priority 5: Fallback to first available language
      if (availableLanguages.length > 0) {
        const firstLang = availableLanguages[0];
        if (label[firstLang] && Array.isArray(label[firstLang])) {
          return { [firstLang]: label[firstLang] };
        }
      }
    }

    return label;
  };

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
                  <LocaleString>{getLocalizedLabel(facet.label)}</LocaleString>
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
                          <LocaleString>{getLocalizedLabel(item.label)}</LocaleString>
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

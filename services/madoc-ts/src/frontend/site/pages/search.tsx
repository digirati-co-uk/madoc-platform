import React from 'react';
import { SearchBox } from '../../shared/atoms/SearchBox';
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
import { SearchHint, ResultsHeader, SearchResults, TotalResults } from '../../shared/components/SearchResults';
import { Spinner } from '../../shared/icons/Spinner';
import { useSearch } from '../hooks/use-search';
import { useSearchFacets } from '../hooks/use-search-facets';
import { useSearchQuery } from '../hooks/use-search-query';
import { ButtonRow, TinyButton } from '../../shared/atoms/Button';

export const Search: React.FC = () => {
  const [{ latestData: searchResponse, resolvedData, isFetchingMore, isLoading }, displayFacets] = useSearch();
  const { rawQuery, page, fulltext, appliedFacets } = useSearchQuery();
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
    <div style={{ display: 'flex' }}>
      <SearchFilterContainer style={{ width: 300 }}>
        <SearchFilterTitle>Refine search</SearchFilterTitle>
        <ButtonRow>
          <TinyButton disabled={!inQueue} onClick={() => applyAllFacets()}>
            Apply
          </TinyButton>
          <TinyButton disabled={!appliedFacets.length} onClick={() => clearAllFacets()}>
            Clear
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
                      <SearchFilterItemCount>{item.count}</SearchFilterItemCount>
                      {isSelected !== 0 ? (
                        <SearchFilterToggle onClick={() => clearSingleFacet(item.key, item.values)}>
                          x
                        </SearchFilterToggle>
                      ) : (
                        <SearchFilterToggle onClick={() => applyFacet(item.key, item.values)}>+</SearchFilterToggle>
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
        <ResultsHeader>Search Results</ResultsHeader>
        <SearchBox large={true} onSearch={setFullTextQuery} placeholder="Keywords" value={fulltext} />
        <SearchHint>Keyword search</SearchHint>
        <TotalResults>
          Found {searchResponse && searchResponse.pagination ? searchResponse.pagination.totalResults : 0} Results
        </TotalResults>
        <Pagination
          page={page}
          totalPages={resolvedData && resolvedData.pagination ? resolvedData.pagination.totalPages : 0}
          stale={!!isFetchingMore}
          extraQuery={rawQuery}
        />
        {isLoading && <Spinner fill="#000" />}
        <SearchResults value={fulltext} searchResults={searchResponse ? searchResponse.results : []} />
        <Pagination
          page={page}
          totalPages={resolvedData && resolvedData.pagination ? resolvedData.pagination.totalPages : 0}
          stale={!!isFetchingMore}
          extraQuery={rawQuery}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { useSearchQuery } from '../hooks/use-search-query';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { SearchResult } from '../../../types/search';
import { useSearch } from '../hooks/use-search';
import { ResultsContainer, SearchItem, TotalResults } from '../../shared/components/SearchResults';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { useTranslation } from 'react-i18next';

interface SearchPageResultsProps {
  background?: string;
  list?: boolean;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}

export const SearchPageResults: React.FC<SearchPageResultsProps> = ({
  list,
  cardBorder,
  textColor,
  background,
  imageStyle,
}) => {
  const [{ resolvedData: searchResponse, latestData }, displayFacets, isLoading] = useSearch();
  const { rawQuery, page, fulltext } = useSearchQuery();
  const { t } = useTranslation();
  const searchResults = searchResponse ? searchResponse.results : [];

  if (!searchResults) {
    return null;
  }
  return isLoading && !searchResponse ? (
    <LoadingBlock />
  ) : (
    <>
      <TotalResults>
        {t('Found {{count}} results', {
          count: searchResponse && searchResponse.pagination ? searchResponse.pagination.totalResults : 0,
        })}
      </TotalResults>
      <ResultsContainer $isFetching={isLoading}>
        <ImageGrid data-view-list={list}>
          {searchResults.map((result: SearchResult, index: number) => {
            return result ? (
              <SearchItem
                result={result}
                key={`${index}__${result.resource_id}`}
                search={fulltext}
                background={background}
                border={cardBorder}
                textColor={textColor}
                list={list}
                imageStyle={imageStyle}
              />
            ) : null;
          })}
        </ImageGrid>
      </ResultsContainer>
    </>
  );
};

blockEditorFor(SearchPageResults, {
  label: 'Search Page Results',
  type: 'default.SearchPageResults',
  anyContext: [],
  requiredContext: [],
  defaultProps: {
    background: '',
    list: true,
    textColor: '',
    cardBorder: '',
    imageStyle: 'fit',
  },
  editor: {
    list: { type: 'checkbox-field', label: 'View', inlineLabel: 'Display as list' },
    background: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
    imageStyle: {
      label: 'Image Style',
      type: 'dropdown-field',
      options: [
        { value: 'covered', text: 'covered' },
        { value: 'fit', text: 'fit' },
      ],
    },
  },
});

import React, { useState } from 'react';
import { useSearchQuery } from '../hooks/use-search-query';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { SearchResult } from '../../../types/search';
import { useSearch } from '../hooks/use-search';
import { ResultsContainer, SearchItem, TotalResults } from '../../shared/components/SearchResults';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { useTranslation } from 'react-i18next';
import { SimpleDropdown } from '../../shared/atoms/SimpleDropdown';
import { Button, ButtonIcon } from '../../shared/navigation/Button';
import { GridIcon } from '../../shared/icons/GridIcon';
import { ListIcon } from '../../shared/icons/ListIcon';

interface SearchPageResultsProps {
  background?: string;
  grid?: boolean;
  snippet?: boolean;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}

export const SearchPageResults: React.FC<SearchPageResultsProps> = ({
  snippet,
  cardBorder,
  textColor,
  background,
  imageStyle,
}) => {
  const { t } = useTranslation();
  const [{ resolvedData: searchResponse, latestData }, displayFacets, isLoading] = useSearch();
  const { rawQuery, page, fulltext } = useSearchQuery();
  const searchResults = searchResponse ? searchResponse.results : [];

  const [resultsView, setResultsView] = useState('list');
  if (!searchResults) {
    return null;
  }
  return isLoading || !searchResponse ? (
    <LoadingBlock />
  ) : (
    <>
      <div style={{ justifyContent: 'space-between', display: 'flex' }}>
        <TotalResults>
          {t('Found {{count}} results', {
            count: searchResponse && searchResponse.pagination ? searchResponse.pagination.totalResults : 0,
          })}
        </TotalResults>

        <SimpleDropdown buttonText={<ButtonIcon>{resultsView === 'list' ? <ListIcon /> : <GridIcon />}</ButtonIcon>}>
          <Button
            $link
            style={{ display: 'flex', justifyContent: 'space-evenly' }}
            onClick={() => {
              setResultsView('list');
            }}
          >
            List
            <ButtonIcon>
              <ListIcon />
            </ButtonIcon>
          </Button>

          <Button
            $link
            style={{ display: 'flex', justifyContent: 'space-evenly' }}
            onClick={() => {
              setResultsView('grid');
            }}
          >
            Grid
            <ButtonIcon>
              <GridIcon />
            </ButtonIcon>
          </Button>
        </SimpleDropdown>
      </div>
      <ResultsContainer $isFetching={isLoading}>
        <ImageGrid data-view-list={resultsView === 'list'} $size={'small'}>
          {searchResults.map((result: SearchResult, index: number) => {
            return result ? (
              <SearchItem
                result={result}
                key={`${index}__${result.resource_id}`}
                search={fulltext}
                background={background}
                border={cardBorder}
                textColor={textColor}
                list={resultsView === 'list'}
                hideSnippet={snippet}
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
  anyContext: ['collection', 'manifest', 'canvas', 'project', 'topic', 'topicType'],
  requiredContext: ['page'],
  defaultProps: {
    background: '',
    snippet: '',
    textColor: '',
    cardBorder: '',
    imageStyle: 'fit',
  },
  editor: {
    snippet: { type: 'checkbox-field', label: 'Snippet', inlineLabel: 'Hide snippet?' },
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

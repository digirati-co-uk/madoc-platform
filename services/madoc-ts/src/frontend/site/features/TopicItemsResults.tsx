import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { SearchResult } from '../../../types/search';
import { ResultsContainer, SearchItem, TotalResults } from '../../shared/components/SearchResults';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useTopicItems } from '../../shared/hooks/use-topic-items';
import { EmptyState } from '../../shared/layout/EmptyState';

interface TopicItemsResults {
  background?: string;
  grid?: boolean;
  snippet?: boolean;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}

export const TopicItemsResults: React.FC<TopicItemsResults> = ({
  grid,
  snippet,
  cardBorder,
  textColor,
  background,
  imageStyle,
}) => {
  const { topic } = useParams<Record<'topic', any>>();
  const [{ data, isLoading, latestData }, { query, page }] = useTopicItems(topic);
  const { t } = useTranslation();
  const searchResults = data?.results ? data.results : [];

  console.log(data, page);
  if (data?.pagination.totalResults === 0) {
    return <EmptyState>Nothing tagged yet</EmptyState>;
  }

  if (!searchResults) {
    return null;
  }
  return isLoading && !data ? (
    <LoadingBlock />
  ) : (
    <>
      <TotalResults>
        {t('Found {{count}} results', {
          count: data && data.pagination ? data.pagination.totalResults : 0,
        })}
      </TotalResults>
      <ResultsContainer $isFetching={isLoading}>
        <ImageGrid data-view-list={!grid} $size={'large'} style={{ gridGap: '1.5em' }}>
          {searchResults.map((result: SearchResult, index: number) => {
            return result ? (
              <SearchItem
                result={result}
                key={`${index}__${result.resource_id}`}
                background={background}
                border={cardBorder}
                textColor={textColor}
                list={!grid}
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

blockEditorFor(TopicItemsResults, {
  label: 'Topic item Results',
  type: 'default.TopicItemsResults',
  anyContext: ['topic'],
  requiredContext: ['topic'],
  defaultProps: {
    background: '',
    grid: '',
    snippet: '',
    textColor: '',
    cardBorder: '',
    imageStyle: 'fit',
  },
  editor: {
    grid: { type: 'checkbox-field', label: 'Display as', inlineLabel: 'Display as grid' },
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

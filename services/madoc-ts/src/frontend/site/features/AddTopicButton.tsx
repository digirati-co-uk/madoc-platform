import React, { useRef } from 'react';
import styled from 'styled-components';
import { Button } from '../../shared/navigation/Button';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { useApi } from '../../shared/hooks/use-api';
import { useInfiniteQuery } from 'react-query';
import { EmptyState } from '../../shared/layout/EmptyState';
import { Spinner } from '../../shared/icons/Spinner';
import { useInfiniteAction } from '../hooks/use-infinite-action';
import { Input, InputContainer, InputLabel } from '../../shared/form/Input';
import { TagPill } from '../hooks/canvas-menu/tagging-panel';
import { AutoCompleteEntitySnippet } from '../../../extensions/enrichment/authority/types';
import { AddTagButton } from './AddTagButton';
import { useTranslation } from 'react-i18next';

export const TopicPill = styled(TagPill)`
  border-color: orange;

`;
export const AddTopicButton: React.FC<{
  statusLoading: boolean;
  onSelected: (slug: string | undefined) => void;
}> = ({ onSelected, statusLoading }) => {
  const container = useRef<HTMLDivElement>(null);
  const [fullText, setFulltext] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<AutoCompleteEntitySnippet | null>(null);
  const api = useApi();
  const { t } = useTranslation();

  const { data: pages, fetchMore, canFetchMore, isFetchingMore, isLoading: queryLoading } = useInfiniteQuery(
    ['topic-type-autocomplete', fullText],
    async (key, _, vars: { page?: number } = { page: 1 }) => {
      return api.enrichment.topicTypeAutoComplete(fullText, vars.page);
    },
    {
      getFetchMore: lastPage => {
        if (lastPage.pagination.totalPages === lastPage.pagination.page) {
          return undefined;
        }
        return {
          page: lastPage.pagination.page + 1,
        };
      },
    }
  );
  const [loadMoreButton] = useInfiniteAction({
    fetchMore,
    canFetchMore,
    isFetchingMore,
    container: container,
  });

  const startAutoComplete = (val: string) => {
    setIsLoading(true);
    setFulltext(val);
    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <p>{t('Choose a topic type first')}</p>
      {selected && selected.slug ? (
        <>
          <div style={{ display: 'flex' }}>
            <p> {t('Topic Type')}: </p>
            <TopicPill style={{ alignSelf: 'end' }}>
              <CloseIcon
                onClick={() => {
                  setSelected(null);
                }}
              />
              {selected.label}
            </TopicPill>
          </div>

          <AddTagButton
            typeSlug={selected.slug}
            typeLabel={selected.label}
            statusLoading={statusLoading}
            onSelected={onSelected}
            hideTopic
          />
        </>
      ) : (
        <>
          <InputContainer>
            <InputLabel htmlFor="tagAuto">{t('Search topic type')}</InputLabel>
            <Input
              onChange={e => startAutoComplete(e.target.value)}
              onBlur={e => startAutoComplete(e.target.value)}
              type="text"
              required
              value={fullText}
            />
          </InputContainer>
          {isLoading || queryLoading ? (
            <EmptyState>
              <Spinner /> ...{t('loading')}
            </EmptyState>
          ) : (
            <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll', display: 'flex', flexWrap: 'wrap' }}>
              {pages?.map((page, key) => {
                return (
                  <React.Fragment key={key}>
                    {page.results.map((result: any) => {
                    return (
                        <TopicPill
                          as={Button}
                          key={result.id}
                          data-is-button={true}
                          onClick={() => setSelected(result)}
                        >
                          {result.label}
                        </TopicPill>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              <Button
                ref={loadMoreButton}
                onClick={() => fetchMore()}
                style={{ display: canFetchMore ? 'block' : 'none' }}
              >
                {t('Load more')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

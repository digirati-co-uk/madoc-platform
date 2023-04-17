import React, { useRef, useState } from 'react';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { useApi } from '../../shared/hooks/use-api';
import { useInfiniteQuery } from 'react-query';
import { EmptyState } from '../../shared/layout/EmptyState';
import { Spinner } from '../../shared/icons/Spinner';
import { useInfiniteAction } from '../hooks/use-infinite-action';
import { Input, InputContainer, InputLabel } from '../../shared/form/Input';
import { TagPill } from '../hooks/canvas-menu/tagging-panel';
import { AutoCompleteEntitySnippet } from '../../../extensions/enrichment/authority/types';
import styled from 'styled-components';

const TagResults = styled.div`
  border: 2px solid #d3d3d3;
  border-radius: 4px;
  width: 560px;
  display: flex;
  flex-wrap: wrap;
  max-height: 300px;
  overflow-y: scroll;
`;
export const AddTagButton: React.FC<{
  topicType: string;
  statusLoading: boolean;
  onSelected: (id: string | undefined) => void;
  hideTopic?: boolean;
}> = ({ topicType, onSelected, statusLoading, hideTopic }) => {
  const container = useRef<HTMLDivElement>(null);
  const [fullText, setFulltext] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<AutoCompleteEntitySnippet | null>(null);
  const api = useApi();

  const { data: pages, fetchMore, canFetchMore, isFetchingMore, isLoading: queryLoading } = useInfiniteQuery(
    ['topic-autocomplete', { fullText, topicType }],
    async (key, _, vars: { page?: number } = { page: 1 }) => {
      return api.enrichment.topicAutoComplete(topicType, fullText, vars.page);
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
    <div>
      {selected ? (
        <>
          {!hideTopic && (
            <p>
              Topic type: <b>{topicType}</b>
            </p>
          )}

          <p>
            Topic: <b>{selected.slug}</b>
          </p>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(197,232,197,0.32)',
              padding: '0.5em',
              borderRadius: '4px',
            }}
          >
            <p> Tag this canvas with: </p>
            <TagPill style={{ alignSelf: 'end' }}>
              <CloseIcon
                onClick={() => {
                  setSelected(null);
                  onSelected(undefined);
                }}
              />
              {selected.slug}
            </TagPill>
          </div>
        </>
      ) : queryLoading || !pages || pages[0].pagination.totalResults === 0 ? (
        <TagResults>
          <EmptyState $noMargin>This type has no topics</EmptyState>
        </TagResults>
      ) : (
        <>
          <InputContainer>
            <InputLabel htmlFor="tagAuto">
              {' '}
              Search topics within <b>{topicType}</b>
            </InputLabel>
            <Input
              onChange={e => startAutoComplete(e.target.value)}
              onBlur={e => startAutoComplete(e.target.value)}
              type="text"
              placeholder={'Search topics'}
              required
              value={fullText}
            />
          </InputContainer>
          {isLoading || queryLoading ? (
            <EmptyState>
              <Spinner /> ...loading
            </EmptyState>
          ) : (
            <TagResults ref={container}>
              {pages?.map((page, key) => {
                return (
                  <React.Fragment key={key}>
                    {page.results.map(result => (
                      <TagPill
                        as={Button}
                        key={result.id}
                        data-is-button={true}
                        onClick={() => {
                          setSelected(result);
                          onSelected(result.id);
                        }}
                      >
                        {result.slug}
                      </TagPill>
                    ))}
                  </React.Fragment>
                );
              })}
              <Button
                ref={loadMoreButton}
                onClick={() => fetchMore()}
                style={{ display: canFetchMore ? 'block' : 'none' }}
              >
                Load more
              </Button>
            </TagResults>
          )}
        </>
      )}
    </div>
  );
};

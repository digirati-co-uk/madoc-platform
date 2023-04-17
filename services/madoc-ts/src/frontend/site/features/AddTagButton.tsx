import React, { useRef } from 'react';
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

export const AddTagButton: React.FC<{
  topicType: string;
  statusLoading: boolean;
  addTag: (id: string | undefined) => Promise<void>;
}> = ({ topicType, addTag, statusLoading }) => {
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

  console.log('h');
  console.log(pages);
  const startAutoComplete = (val: string) => {
    setIsLoading(true);
    setFulltext(val);
    setIsLoading(false);
  };

  return (
    <div>
      {selected ? (
        <>
          <div style={{ display: 'flex' }}>
            <p> Tag this canvas with </p>
            <TagPill style={{ alignSelf: 'end' }}>
              <CloseIcon
                onClick={() => {
                  setSelected(null);
                }}
              />
              {selected.slug}
            </TagPill>
          </div>
          <ButtonRow>
            <Button
              onClick={() => {
                setSelected(null);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={statusLoading}
              onClick={() =>
                addTag(selected?.id).then(() => {
                  setSelected(null);
                })
              }
            >
              Submit
            </Button>
          </ButtonRow>
        </>
      ) : queryLoading && (!pages || pages[0].pagination.totalResults === 0) ? (
        <p color={'grey'}>This type has no topics</p>
      ) : (
        <>
          <InputContainer>
            <InputLabel htmlFor="tagAuto">Search topics</InputLabel>
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
              <Spinner /> ...loading
            </EmptyState>
          ) : (
            <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll', display: 'flex', flexWrap: 'wrap' }}>
              {pages?.map((page, key) => {
                return (
                  <React.Fragment key={key}>
                    {page.results.map(result => (
                      <TagPill as={Button} key={result.id} data-is-button={true} onClick={() => setSelected(result)}>
                        {result.label}
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

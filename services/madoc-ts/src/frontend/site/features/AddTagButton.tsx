import React, { lazy, useEffect, useRef } from 'react';
import { Button } from '../../shared/navigation/Button';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { useApi } from '../../shared/hooks/use-api';
import { useInfiniteQuery } from 'react-query';
import { EmptyState } from '../../shared/layout/EmptyState';
import { Spinner } from '../../shared/icons/Spinner';
import { useInfiniteAction } from '../hooks/use-infinite-action';
import { Input, InputContainer, InputLabel } from '../../shared/form/Input';
import { TagPill } from '../hooks/canvas-menu/tagging-panel';
import { AutoCompleteEntitySnippet } from '../../../extensions/enrichment/types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { LocaleString } from '../../shared/components/LocaleString';

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
  typeSlug: string;
  typeLabel: string;
  statusLoading: boolean;
  onSelected: (id: string | undefined) => void;
  hideTopic?: boolean;
  postSubmission: boolean;
}> = ({ typeSlug, typeLabel, onSelected, statusLoading, hideTopic, postSubmission }) => {
  const container = useRef<HTMLDivElement>(null);
  const [fullText, setFulltext] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<AutoCompleteEntitySnippet | null>(null);
  const api = useApi();
  const { t } = useTranslation();

  useEffect(() => {
    if (!postSubmission && selected) {
      setSelected(null);
    }
  }, [postSubmission]);

  const { data: pages, fetchMore, canFetchMore, isFetchingMore, isLoading: queryLoading } = useInfiniteQuery(
    ['topic-autocomplete', { fullText, typeSlug }],
    async (key, _, vars: { page?: number } = { page: 1 }) => {
      return api.enrichment.entityAutoComplete(typeSlug, fullText, vars.page);
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
    const timeout = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timeout);
  };

  // const { data } = useEnrichmentResource();
  // const tags = data?.entity_tags;
  // const appliedTagIDs = tags?.map(tag => tag.entity.id);

  if (selected && postSubmission) {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(197,232,197,0.32)',
            padding: '0.5em',
            borderRadius: '4px',
          }}
        >
          <p> {t('Canvas tagged with')}: </p>
          <TagPill style={{ alignSelf: 'end' }}>
            <LocaleString>{selected.title}</LocaleString>
          </TagPill>
        </div>
      </div>
    );
  }

  return (
    <div>
      {selected ? (
        <>
          {!hideTopic && (
            <p>
              {t('Topic type')}: <b>{typeLabel}</b>
            </p>
          )}

          <p>
            {t('Topic')}: <LocaleString>{selected.title}</LocaleString>
          </p>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(197,232,197,0.32)',
              padding: '0.5em',
              borderRadius: '4px',
            }}
          >
            <p> {t('Tag this canvas with')}: </p>
            <TagPill style={{ alignSelf: 'end' }}>
              <CloseIcon
                onClick={() => {
                  setSelected(null);
                  onSelected(undefined);
                }}
              />
              <LocaleString>{selected.title}</LocaleString>
            </TagPill>
          </div>
        </>
      ) : queryLoading || isLoading ? (
        <TagResults>
          <EmptyState $noMargin>...loading</EmptyState>
        </TagResults>
      ) : !pages || (pages[0].pagination.totalResults === 0 && !fullText) ? (
        <TagResults>
          <EmptyState $noMargin>{t('This type has no topics')}</EmptyState>
        </TagResults>
      ) : (
        <>
          <InputContainer>
            <InputLabel htmlFor="tagAuto">
              {t('Search topics within')} <b style={{ textTransform: 'capitalize' }}>{typeLabel}</b>
            </InputLabel>
            <Input
              onChange={e => startAutoComplete(e.target.value)}
              onBlur={e => startAutoComplete(e.target.value)}
              type="text"
              placeholder={t('Search topics')}
              required
              value={fullText}
            />
          </InputContainer>
          {isLoading || queryLoading ? (
            <EmptyState>
              <Spinner stroke="#000" />
            </EmptyState>
          ) : !pages || (pages[0].pagination.totalResults === 0 && fullText) ? (
            <TagResults>
              <EmptyState $noMargin>{t('No results')}</EmptyState>
            </TagResults>
          ) : (
            <TagResults ref={container}>
              {pages?.map((page, key) => {
                return (
                  <React.Fragment key={key}>
                    {page.results.map(result => {
                      const appliedTagIDs = page.results?.map(tag => tag.id);
                      return !appliedTagIDs?.includes(result.id) ? (
                        <TagPill key={result.id} data-is-applied={true} title={'applied'}>
                          {result.label}
                        </TagPill>
                      ) : (
                        <TagPill
                          as={Button}
                          key={result.id}
                          data-is-button={true}
                          onClick={() => {
                            setSelected(result);
                            onSelected(result.id);
                          }}
                        >
                          {result.label}
                        </TagPill>
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
            </TagResults>
          )}
        </>
      )}
    </div>
  );
};

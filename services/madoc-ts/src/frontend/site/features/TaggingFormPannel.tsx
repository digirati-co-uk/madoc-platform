import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { MetadataEmptyState } from '../../shared/atoms/MetadataConfiguration';
import { useEnrichmentResource } from '../pages/loaders/enrichment-resource-loader';
import { EntityTagSnippet } from '../../../extensions/enrichment/authority/types';
import { Button, ButtonRow, TextButton } from '../../shared/navigation/Button';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { ModalButton } from '../../shared/components/Modal';
import { useApi } from '../../shared/hooks/use-api';
import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import { PlusIcon } from '../../shared/icons/PlusIcon';
import { EmptyState } from '../../shared/layout/EmptyState';
import { Spinner } from '../../shared/icons/Spinner';
import {
  AutocompleteField,
  CompletionItem,
} from '../../shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { useSearchQuery } from '../hooks/use-search-query';
import { Select } from 'react-functional-select';
import { ErrorMessage } from '../../shared/capture-models/editor/atoms/Message';
import { useInfiniteAction } from '../hooks/use-infinite-action';
import { Input, InputContainer, InputLabel } from '../../shared/form/Input';
import { useRefetch } from '../../shared/utility/refetch-context';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { buttons } from '../../../../stories/legacy/atoms.stories';

const TaggingContainer = styled.div`
  padding: 0.5em;
`;
const TagBox = styled.div`
  padding: 0.3em;
  margin: 1em 0;
  border: 1px solid #002d4b;
`;
const TagTitle = styled.div`
  font-size: 1em;
  color: #004761;
  text-transform: uppercase;
`;

const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 1em 0;
`;

const TagPill = styled.div`
  font-size: 0.8em;
  border: 2px solid #009f18;
  border-radius: 4px;
  color: #004761;
  padding: 0.2em;
  margin: 0 1em 1em 0.5em;
  display: flex;

  &[data-is-button='true'] {
    font-size: 1em;
    padding: 0.4em;
    margin: 0.5em;
  }
  span {
    display: block;
    max-width: 20px;
    max-height: 20px;
  }

  svg {
    max-width: 18px;
    max-height: 18px;
    padding: 0;
    margin: 0;
    fill: #002d4b;

    :hover {
      fill: #009f18;
    }
  }
`;

const AddTags: React.FC<{ topicType: string }> = ({ topicType }) => {
  const container = useRef<HTMLDivElement>(null);
  const [fullText, setFulltext] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  const api = useApi();
  console.log(selected);
  const { data: pages, fetchMore, canFetchMore, isFetchingMore, isLoading: queryLoading } = useInfiniteQuery(
    ['topic-autocomplete', fullText],
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

  const startAutoComplete = val => {
    setIsLoading(true);
    setFulltext(val);
    setIsLoading(false);
  };

  if (!pages || !pages[0].results) {
    return (
      <EmptyState>
        <Spinner />
      </EmptyState>
    );
  }
  return (
    <div>
      {selected && (
        <TagPill>
          <CloseIcon onClick={() => {setSelected(null)}} /> {selected.slug}
        </TagPill>
      )}
      <InputContainer>
        <InputLabel htmlFor="tagAuto">something</InputLabel>
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
                {page.results.map((result, key) => (
                  // eslint-disable-next-line react/jsx-key
                  <TagPill as={Button} key={key} data-is-button={true} onClick={() => setSelected(result)}>
                    {result.slug}
                  </TagPill>
                ))}
              </React.Fragment>
            );
          })}
          <Button ref={loadMoreButton} onClick={() => fetchMore()} style={{ display: canFetchMore ? 'block' : 'none' }}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

const AddTagsBottom: React.FC<{
  tagId: string;
  close: () => void;
  addTag: (id: string) => Promise<void>;
  isLoading?: boolean;
}> = ({ tagId, close, addTag, isLoading }) => {
  // const api = useApi();
  // const { data } = useQuery(['remove-tag', { tagId }], async () => {
  //   return api.enrichment.getResourceTag(tagId);
  // });
  // if (!data) {
  //   return null;
  // }

  return (
    <ButtonRow $noMargin>
      <Button onClick={() => close()}>Cancel</Button>
      {/*<Button disabled={isLoading} onClick={() => add(tagId).then(close)}>*/}
      {/*  Submit*/}
      {/*</Button>*/}
    </ButtonRow>
  );
};
const ConfirmDeletion: React.FC<{ tagLabel: string }> = ({ tagLabel }) => {
  return (
    <PillContainer>
      Remove <TagPill> {tagLabel} </TagPill> ?{' '}
    </PillContainer>
  );
};

const ConfirmDeletionBottom: React.FC<{
  tagId: string;
  close: () => void;
  remove: (id: string) => Promise<void>;
  isLoading?: boolean;
}> = ({ tagId, close, remove, isLoading }) => {
  const api = useApi();
  const { data } = useQuery(['remove-tag', { tagId }], async () => {
    return api.enrichment.getResourceTag(tagId);
  });
  if (!data) {
    return null;
  }

  return (
    <ButtonRow $noMargin>
      <Button onClick={() => close()}>Cancel</Button>
      <Button disabled={isLoading} onClick={() => remove(tagId).then(close)}>
        Remove
      </Button>
    </ButtonRow>
  );
};
export const TaggingFormPannel = () => {
  const { t } = useTranslation();
  const { data, refetch } = useEnrichmentResource();
  const tags = data?.entity_tags;
  const api = useApi();

  const tagTypes = tags?.reduce((tag, elem) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tag[elem.entity.type] = (tag[elem.entity.type] || []).concat(elem);
    return tag;
  }, {});

  const newTags = tagTypes ? Object.entries(tagTypes) : [];

  const [remove, removeStatus] = useMutation(async (id: string) => {
    await api.enrichment.removeResourceTag(id);
    await refetch();
  });
  const [add, addStatus] = useMutation(async (id: string) => {
    // await api.enrichment.removeResourceTag(id);
    await refetch();
  });

  return (
    <TaggingContainer>
      {newTags.length === 0 ? <MetadataEmptyState style={{ marginTop: 100 }}>{t('No tags')}</MetadataEmptyState> : null}
      {newTags.map((tagType: any) => (
        <TagBox key={tagType[0]}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <TagTitle>{tagType[0]}</TagTitle>

            <ModalButton
              title="Create tag"
              render={() => {
                return <AddTags topicType={tagType[0]} />;
              }}
              footerAlignRight
              renderFooter={({ close }) => (
                <AddTagsBottom addTag={add} close={close} isLoading={addStatus.isLoading} tagId={'selected'} />
              )}
            >
              <PlusIcon /> Add
            </ModalButton>
          </div>
          <PillContainer>
            {tagType[1].map((tag: EntityTagSnippet) =>
              tag.entity && tag.entity.label ? (
                <TagPill>
                  <ModalButton
                    autoHeight
                    title="Remove tag?"
                    render={() => {
                      return <ConfirmDeletion tagLabel={tag.entity.label} />;
                    }}
                    footerAlignRight
                    renderFooter={({ close }) => (
                      <ConfirmDeletionBottom
                        tagId={tag.tag_id}
                        remove={remove}
                        close={close}
                        isLoading={removeStatus.isLoading}
                      />
                    )}
                  >
                    <CloseIcon />
                  </ModalButton>
                  {tag.entity.label}
                </TagPill>
              ) : null
            )}
          </PillContainer>
        </TagBox>
      ))}
    </TaggingContainer>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetadataEmptyState } from '../../shared/atoms/MetadataConfiguration';
import { useEnrichmentResource } from '../pages/loaders/enrichment-resource-loader';
import { EntityTagSnippet } from '../../../extensions/enrichment/authority/types';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { ModalButton } from '../../shared/components/Modal';
import { useApi } from '../../shared/hooks/use-api';
import { useMutation, useQuery } from 'react-query';
import { PlusIcon } from '../../shared/icons/PlusIcon';
import { useRouteContext } from '../hooks/use-route-context';
import { TagPill, PillContainer, TagTitle, TagBox, TaggingContainer } from '../hooks/canvas-menu/tagging-panel';
import { AddTagButton } from './AddTagButton';
import { AddTopicButton } from './AddTopicButton';

const ConfirmDeletion: React.FC<{ tagLabel: string }> = ({ tagLabel }) => {
  return (
    <PillContainer>
      Remove topic tag from resource <TagPill> {tagLabel} </TagPill> ?{' '}
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
      <Button $primary disabled={isLoading} onClick={() => remove(tagId).then(close)}>
        Remove
      </Button>
      <Button onClick={() => close()}>Cancel</Button>
    </ButtonRow>
  );
};
export const TaggingFormPannel = () => {
  const { t } = useTranslation();
  const { data, refetch } = useEnrichmentResource();
  const { canvasId } = useRouteContext();
  const tags = data?.entity_tags;
  const api = useApi();

  const tagTypes = tags?.reduce((tag, elem) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tag[elem.entity.type] = (tag[elem.entity.type] || []).concat(elem);
    return tag;
  }, {});

  const newTags = tagTypes ? Object.entries(tagTypes) : [];
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);

  const [remove, removeStatus] = useMutation(async (id: string) => {
    await api.enrichment.removeResourceTag(id);
    await refetch();
  });
  const [addTag, addStatus] = useMutation(async (entitySlug: string) => {
    await api.enrichment.tagMadocResource(entitySlug, 'canvas', canvasId);
    setSelectedSlug(undefined);
    await refetch();
  });

  const onSelect = (id: string | undefined) => {
    setSelectedSlug(id);
  };
  return (
    <TaggingContainer>
      <ModalButton
        style={{ fontWeight: '500', display: 'block', marginBottom: '0.5em' }}
        title={t('Tag this resource')}
        render={() => <AddTopicButton onSelected={onSelect} statusLoading={addStatus.isLoading} />}
        footerAlignRight
        renderFooter={({ close }) => (
          <ButtonRow $noMargin>
            <Button
              $primary
              disabled={!selectedSlug}
              onClick={() => {
                addTag(selectedSlug).then(() => close());
              }}
            >
              {t('Submit')}
            </Button>
            <Button
              onClick={() => {
                setSelectedSlug(undefined);
                close();
              }}
            >
              {t('Cancel')}
            </Button>
          </ButtonRow>
        )}
      >
        <Button>{t('Add new')}</Button>
      </ModalButton>
      {newTags.length === 0 ? <MetadataEmptyState style={{ marginTop: 100 }}>{t('No tags')}</MetadataEmptyState> : null}

      {newTags.map((tagType: any) => (
        <TagBox key={tagType[0]}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <TagTitle>{tagType[0]}</TagTitle>

            <ModalButton
              style={{ cursor: 'pointer' }}
              title={t('Tag this resource')}
              render={() => (
                <AddTagButton
                  topicType={tagType[1][0].entity.type_slug}
                  onSelected={onSelect}
                  statusLoading={addStatus.isLoading}
                />
              )}
              footerAlignRight
              renderFooter={({ close }) => (
                <ButtonRow $noMargin>
                  <Button
                    $primary
                    disabled={!selectedSlug}
                    onClick={() => {
                      addTag(selectedSlug).then(() => close());
                    }}
                  >
                    {t('Submit')}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedSlug(undefined);
                      close();
                    }}
                  >
                    {t('Cancel')}
                  </Button>
                </ButtonRow>
              )}
            >
              <PlusIcon /> {t('Add')}
            </ModalButton>
          </div>
          <PillContainer>
            {tagType[1].map((tag: EntityTagSnippet) =>
              tag.entity && tag.entity.label ? (
                <TagPill>
                  <ModalButton
                    autoHeight
                    title={t('Remove tag')}
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

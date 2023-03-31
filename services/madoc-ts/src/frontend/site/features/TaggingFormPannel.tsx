import React from 'react';
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

  const [remove, removeStatus] = useMutation(async (id: string) => {
    await api.enrichment.removeResourceTag(id);
    await refetch();
  });
  const [addTag, addStatus] = useMutation(async (entityId: string) => {
    await api.enrichment.tagMadocResource(entityId, 'canvas', canvasId);
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
              render={() => <AddTagButton topicType={tagType[0]} addTag={addTag} statusLoading={addStatus.isLoading} />}
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

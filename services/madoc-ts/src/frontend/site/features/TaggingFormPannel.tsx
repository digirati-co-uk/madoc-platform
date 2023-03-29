import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { MetadataEmptyState } from '../../shared/atoms/MetadataConfiguration';
import { useEnrichmentResource } from '../pages/loaders/enrichment-resource-loader';
import { EntityTagSnippet } from '../../../extensions/enrichment/authority/types';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { ModalButton } from '../../shared/components/Modal';
import { useApi } from '../../shared/hooks/use-api';
import { useMutation, useQuery } from 'react-query';

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

  return (
    <TaggingContainer>
      {newTags.length === 0 ? <MetadataEmptyState style={{ marginTop: 100 }}>{t('No tags')}</MetadataEmptyState> : null}
      {newTags.map((tagType: any) => (
        <TagBox key={tagType[0]}>
          <TagTitle>{tagType[0]}</TagTitle>
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

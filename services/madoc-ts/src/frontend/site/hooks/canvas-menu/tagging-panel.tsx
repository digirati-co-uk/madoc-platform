import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { CanvasMenuHook } from './types';
import { useEnrichmentResource } from '../../pages/loaders/enrichment-resource-loader';
import { EntityTagSnippet } from '../../../../extensions/enrichment/authority/types';
import TaggingIcon from '../../../shared/icons/TaggingIcon';
import { Link } from 'react-router-dom';
import { createLink } from '../../../shared/utility/create-link';

export const TaggingContainer = styled.div`
  padding: 0;
`;
export const TagBox = styled.div`
  padding: 0.3em;
  margin-bottom: 1em;
  border: 1px solid #002d4b;
`;
export const TagTitle = styled.div`
  font-size: 1em;
  color: #004761;
  text-transform: uppercase;
`;

export const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 1em 0;
`;

export const TagPill = styled.div`
  font-size: 0.8em;
  border: 2px solid #009f18;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.9);
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

export function useTaggingPanel(): CanvasMenuHook {
  const { t } = useTranslation();
  const { data } = useEnrichmentResource();
  const tags = data?.entity_tags;

  const tagTypes = tags?.reduce((tag, elem) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tag[elem.entity.type] = (tag[elem.entity.type] || []).concat(elem);
    return tag;
  }, {});

  const newTags = tagTypes ? Object.entries(tagTypes) : [];
  const content = (
    <TaggingContainer>
      {newTags.length === 0 ? <MetadataEmptyState style={{ marginTop: 100 }}>{t('No tags')}</MetadataEmptyState> : null}
      {newTags.map((tagType: any) => (
        <TagBox key={tagType[0]}>
          <TagTitle>{tagType[0]}</TagTitle>
          <PillContainer>
            {tagType[1].map((tag: EntityTagSnippet) =>
              tag.entity && tag.entity.label ? (
                <TagPill as={Link} to={createLink({ topicType: tag.entity.type_slug, topic: tag.entity.slug })}>
                  {tag.entity.label}
                </TagPill>
              ) : null
            )}
          </PillContainer>
        </TagBox>
      ))}
    </TaggingContainer>
  );

  return {
    id: 'Tags',
    label: t('Tags'),
    icon: <TaggingIcon />,
    isLoaded: true,
    notifications: 0,
    content,
  };
}

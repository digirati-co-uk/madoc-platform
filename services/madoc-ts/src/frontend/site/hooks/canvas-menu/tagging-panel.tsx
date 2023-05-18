import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { CanvasMenuHook } from './types';
import { EntityTagSnippet } from '../../../../extensions/enrichment/types';
import TaggingIcon from '../../../shared/icons/TaggingIcon';
import { Link } from 'react-router-dom';
import { createLink } from '../../../shared/utility/create-link';
import { useGetResourceTags } from './use-get-tags';

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
  text-decoration: none;
  align-items: center;
  text-transform: uppercase;

  &[data-is-button='true'] {
    padding: 0.4em;
    margin: 0.5em;

    :hover {
      background-color: #009f18;
      color: white;
      border-color: #009f18;
    }
  }

  &[data-is-applied='true'] {
    border-color: #4d5f50;
    padding: 0.4em;
    margin: 0.5em;
    cursor: pointer;
  }

  span {
    display: block;
    font-size: 0.8em;
    vertical-align: middle;
    padding: 0;

    width: 18px;
    height: 18px;
  }

  svg {
    width: 18px;
    height: 18px;
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
  const ResourceTags = useGetResourceTags();

  const content = (
    <TaggingContainer>
      {ResourceTags.length === 0 ? (
        <MetadataEmptyState style={{ marginTop: 100 }}>{t('No tags')}</MetadataEmptyState>
      ) : null}
      {ResourceTags.map(tagType => (
        <TagBox key={tagType.type}>
          <TagTitle>{tagType.type}</TagTitle>
          <PillContainer>
            {tagType.tags.map((tag: EntityTagSnippet) =>
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

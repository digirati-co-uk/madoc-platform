import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ButtonRow, SmallButton } from '../../../shared/navigation/Button';
import {
  MetadataCard,
  MetadataCardItem,
  MetadataCardLabel,
  MetadataEmptyState,
} from '../../../shared/atoms/MetadataConfiguration';
import { useHighlightedRegions } from '../../../shared/hooks/use-highlighted-regions';
import { AnnotationsIcon } from '../../../shared/icons/AnnotationsIcon';
import { useProjectAnnotationStyles } from '../use-project-annotation-styles';
import { CanvasMenuHook } from './types';
import { useEnrichmentResource } from '../../pages/loaders/enrichment-resource-loader';
import { EntityTagSnippet } from '../../../../extensions/enrichment/authority/types';
import TaggingIcon from '../../../shared/icons/TaggingIcon';
import { Link } from 'react-router-dom';
import { createLink } from '../../../shared/utility/create-link';

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
  margin: 0 1em 1em 0;
`;

export function useTaggingPanel(): CanvasMenuHook {
  const { t } = useTranslation();
  const { data } = useEnrichmentResource();
  const tags = data?.entity_tags;

  // not sure we have regions yet...
  const {
    currentCollection,
    regionCollections,
    setHighlightStatus,
    regions,
    setCurrentCollection,
    setIsActive,
  } = useHighlightedRegions();
  const styles = useProjectAnnotationStyles();

  //tag.entity.type
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
    id: 'tagging',
    label: t('Tags'),
    icon: <TaggingIcon />,
    isLoaded: true,
    notifications: regions.length,
    content,
  };
}

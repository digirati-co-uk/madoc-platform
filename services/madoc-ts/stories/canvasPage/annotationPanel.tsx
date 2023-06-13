import { CanvasMenuHook } from '../../src/frontend/site/hooks/canvas-menu/types';
import { useTranslation } from 'react-i18next';
import { useHighlightedRegions } from '../../src/frontend/shared/hooks/use-highlighted-regions';
import { useProjectAnnotationStyles } from '../../src/frontend/site/hooks/use-project-annotation-styles';
import React, { useEffect } from 'react';
import {
  MetadataCard,
  MetadataCardItem,
  MetadataCardLabel,
  MetadataEmptyState,
} from '../../src/frontend/shared/atoms/MetadataConfiguration';
import { ButtonRow, SmallButton } from '../../src/frontend/shared/navigation/Button';
import { AnnotationsIcon } from '../../src/frontend/shared/icons/AnnotationsIcon';
import styled from 'styled-components';

const AnnotationContainer = styled.div`
  padding: 0.5em;
`;
export function AnnotationPanel(): CanvasMenuHook {
  const { t } = useTranslation();
  const {
    currentCollection,
    regionCollections,
    setHighlightStatus,
    regions,
    setCurrentCollection,
  } = useHighlightedRegions();

  <AnnotationContainer>
    <ButtonRow>
      {regions.length !== 0 || regionCollections.length > 1 ? (
        <SmallButton onClick={() => setCurrentCollection(undefined)}>{t('Back to list')}</SmallButton>
      ) : null}
    </ButtonRow>

    {regions.length === 0 ? (
      <MetadataEmptyState style={{ marginTop: 100 }}>{t('No annotations')}</MetadataEmptyState>
    ) : null}

    {regions.map(item => {
      return (
        <MetadataCardItem
          key={item.id}
          onMouseOver={() => setHighlightStatus(item.id, true)}
          onMouseOut={() => setHighlightStatus(item.id, false)}
        >
          <MetadataCard interactive>
            <MetadataCardLabel>{item.label}</MetadataCardLabel>
          </MetadataCard>
        </MetadataCardItem>
      );
    })}
  </AnnotationContainer>;

  return {
    id: 'annotations',
    label: t('Annotations'),
    icon: <AnnotationsIcon />,
    isLoaded: true,
    notifications: regions.length,
    content,
  };
}

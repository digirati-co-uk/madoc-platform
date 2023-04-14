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

const AnnotationContainer = styled.div`
  padding: 0.5em;
`;

export function useAnnotationPanel(active: boolean): CanvasMenuHook {
  const { t } = useTranslation();
  const {
    currentCollection,
    regionCollections,
    setHighlightStatus,
    regions,
    setCurrentCollection,
    setIsActive,
  } = useHighlightedRegions();
  const styles = useProjectAnnotationStyles();
  useEffect(() => {
    setIsActive(active);
  }, [active, setIsActive]);

  const content = !currentCollection ? (
    <AnnotationContainer>
      {regionCollections.length === 0 ? (
        <MetadataEmptyState style={{ marginTop: 100 }}>{t('No annotations')}</MetadataEmptyState>
      ) : null}
      {regionCollections.map(col => {
        return (
          <MetadataCardItem key={col.id} onClick={() => setCurrentCollection(col.id)}>
            <MetadataCard interactive>
              <MetadataCardLabel>{col.label}</MetadataCardLabel>
            </MetadataCard>
          </MetadataCardItem>
        );
      })}
    </AnnotationContainer>
  ) : (
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
            // onMouseOver={styles.contributedAnnotations.hotspot ? undefined : () => setHighlightStatus(item.id, true)}
            // onMouseOut={styles.contributedAnnotations.hotspot ? undefined : () => setHighlightStatus(item.id, false)}
            onMouseOver={() => setHighlightStatus(item.id, true)}
            onMouseOut={() => setHighlightStatus(item.id, false)}
          >
            <MetadataCard interactive>
              <MetadataCardLabel>{item.label}</MetadataCardLabel>
            </MetadataCard>
          </MetadataCardItem>
        );
      })}
    </AnnotationContainer>
  );

  return {
    id: 'annotations',
    label: t('Annotations'),
    icon: <AnnotationsIcon />,
    isLoaded: true,
    notifications: regions.length,
    content,
  };
}

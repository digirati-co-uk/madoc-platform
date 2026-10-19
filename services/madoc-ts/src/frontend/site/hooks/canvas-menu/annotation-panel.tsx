import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonRow, SmallButton } from '../../../shared/navigation/Button';
import {
  MetadataCard,
  MetadataCardItem,
  MetadataCardLabel,
  MetadataEmptyState,
} from '../../../shared/atoms/MetadataConfiguration';
import { useHighlightedRegions } from '../../../shared/hooks/use-highlighted-regions';
import { AnnotationsIcon } from '../../../shared/icons/AnnotationsIcon';
import { useSelectorHelper } from '../../../shared/capture-models/editor/stores/selectors/selector-helper';
import { CanvasMenuHook } from './types';

export function useAnnotationPanel(active: boolean): CanvasMenuHook {
  const { t } = useTranslation();
  const { currentCollection, regionCollections, setHighlightStatus, regions, setCurrentCollection, setIsActive } =
    useHighlightedRegions();
  const controller = useSelectorHelper();

  useEffect(() => {
    setIsActive(active);
  }, [active, setIsActive]);

  const content = !currentCollection ? (
    <div className="p-2">
      {regionCollections.length === 0 ? (
        <MetadataEmptyState style={{ marginTop: 100 }}>{t('No annotations')}</MetadataEmptyState>
      ) : null}
      {regionCollections.map(col => {
        return (
          <MetadataCardItem
            as="button"
            type="button"
            className="w-full text-left"
            key={col.id}
            onClick={() => setCurrentCollection(col.id)}
          >
            <MetadataCard interactive>
              <MetadataCardLabel>{col.label}</MetadataCardLabel>
            </MetadataCard>
          </MetadataCardItem>
        );
      })}
    </div>
  ) : (
    <div className="p-2">
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
            as="button"
            type="button"
            className="w-full text-left"
            key={item.id}
            onClick={() => controller.withSelector(item.id).zoomTo()}
            onFocus={() => setHighlightStatus(item.id, true)}
            onBlur={() => setHighlightStatus(item.id, false)}
            onMouseOver={() => setHighlightStatus(item.id, true)}
            onMouseOut={() => setHighlightStatus(item.id, false)}
          >
            <MetadataCard interactive>
              <MetadataCardLabel>{item.label}</MetadataCardLabel>
            </MetadataCard>
          </MetadataCardItem>
        );
      })}
    </div>
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

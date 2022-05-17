import { AnnotationPage } from '@iiif/presentation-3';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnnotationPage } from '../../shared/hooks/use-annotation-page';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useHighlightedRegions } from '../../shared/hooks/use-highlighted-regions';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasHighlightedRegions: React.FC = () => {
  const { canvasId, projectId } = useRouteContext();
  const { data } = apiHooks.getSiteCanvasPublishedModels(() =>
    canvasId ? [canvasId, { project_id: projectId, selectors: true, format: 'capture-model-with-pages' }] : undefined
  );
  const annotationPages: Array<{ id: string; label: string }> | undefined = data?.pages;
  const { setRegionCollections, currentCollection, setRegions, setCurrentCollection } = useHighlightedRegions();
  const { t } = useTranslation();

  useEffect(() => {
    setRegionCollections([]);
    setRegions([]);
    setCurrentCollection(undefined);
  }, [canvasId, setCurrentCollection, setRegionCollections, setRegions]);

  useEffect(() => {
    if (annotationPages) {
      setRegionCollections(annotationPages);
      if (annotationPages.length === 1) {
        setCurrentCollection(annotationPages[0].id);
      }
    }
  }, [annotationPages, setCurrentCollection, setRegionCollections, t]);

  const { annotationRegions } = useAnnotationPage(currentCollection);

  useEffect(() => {
    setRegions(annotationRegions);
  }, [annotationRegions, setRegions]);

  return null;
};

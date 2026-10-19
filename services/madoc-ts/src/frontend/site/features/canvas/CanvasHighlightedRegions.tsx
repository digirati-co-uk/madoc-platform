import { useEffect, useMemo } from 'react';
import { useApiCanvas } from '../../../shared/hooks/use-api-canvas';
import { useTranslation } from 'react-i18next';
import { useAnnotationPage } from '../../../shared/hooks/use-annotation-page';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { useHighlightedRegions } from '../../../shared/hooks/use-highlighted-regions';
import { useRouteContext } from '../../hooks/use-route-context';

export function CanvasHighlightedRegions() {
  const { canvasId, projectId } = useRouteContext();
  const { data } = apiHooks.getSiteCanvasPublishedModels(() =>
    canvasId ? [canvasId, { project_id: projectId, selectors: true, format: 'capture-model-with-pages' }] : undefined
  );
  const { data: canvasData } = useApiCanvas(canvasId, true, { annotations: true });
  const importedPages = canvasData?.canvas.annotations;
  const annotationPages: Array<{ id: string; label: string }> = useMemo(
    () => [
      ...(data?.pages || []),
      ...(importedPages || []).map(page => ({
        id: page.id,
        label: page.label ? Object.values(page.label).flat().join(' ') : 'Imported annotations',
      })),
    ],
    [data?.pages, importedPages]
  );
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

  const { annotationRegions } = useAnnotationPage(
    currentCollection,
    importedPages?.find(page => page.id === currentCollection),
    canvasData?.canvas
  );

  useEffect(() => {
    setRegions(annotationRegions);
  }, [annotationRegions, setRegions]);

  return null;
}

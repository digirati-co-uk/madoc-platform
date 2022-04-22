import { BoxStyle } from '@atlas-viewer/atlas';
import { useEffect, useMemo, useState } from 'react';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { useProjectAnnotationStyles } from '../../site/hooks/use-project-annotation-styles';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { useSelectorController } from '../capture-models/editor/stores/selectors/selector-helper';
import { traverseDocument } from '../capture-models/helpers/traverse-document';
import { apiHooks } from './use-api-query';
import { useHighlightedRegions } from './use-highlighted-regions';
import { useLocalStorage } from './use-local-storage';
import { annotationPageToRegions } from '../utility/annotation-page-to-regions';

interface ReadOnlyAnnotation {
  id: string;
  target: { x: number; y: number; width: number; height: number };
  style: BoxStyle;
}

export function useReadOnlyAnnotations(isModelPage = false): ReadOnlyAnnotation[] {
  const [openPanel] = useLocalStorage<string>(`canvas-page-selected`, 'metadata');
  const [isOpen] = useLocalStorage<boolean>(`canvas-page-sidebar`, false);
  const { projectId, canvasId } = useRouteContext();
  const styles = useProjectAnnotationStyles();
  const controller = useSelectorController();
  const { highlighted } = useHighlightedRegions();
  const [highlightedAnnotation, setHighlightedAnnotation] = useState<string | null>(null);
  const [highlightedDocumentRegion, setHighlightedDocumentRegion] = useState<string | null>(null);
  const config = useSiteConfiguration();
  const { data } = apiHooks.getSiteCanvasPublishedModels(
    () =>
      canvasId
        ? [canvasId, { project_id: projectId, selectors: true, format: 'capture-model-with-pages-resolved' }]
        : undefined,
    { refetchOnWindowFocus: false }
  );

  const modelPageShowAnnotations = config.project?.modelPageShowAnnotations || 'when-open';
  const modelPageShowDocument = config.project?.modelPageShowDocument || 'when-open';
  const canvasPageShowAnnotations = config.project?.canvasPageShowAnnotations || 'when-open';
  const canvasPageShowDocument = config.project?.canvasPageShowDocument || 'when-open';

  const showAnnotations = isModelPage
    ? modelPageShowAnnotations === 'always' ||
      (modelPageShowAnnotations === 'when-open' && isOpen && openPanel === 'annotations')
    : canvasPageShowAnnotations === 'always' ||
      (canvasPageShowAnnotations === 'when-open' && isOpen && openPanel === 'annotations');

  const showDocumentRegions = isModelPage
    ? modelPageShowDocument === 'always' ||
      (modelPageShowDocument === 'when-open' && isOpen && openPanel === 'document')
    : canvasPageShowDocument === 'always' ||
      (canvasPageShowDocument === 'when-open' && isOpen && openPanel === 'document');

  const annotations = useMemo(() => {
    const regions: ReadOnlyAnnotation[] = [];
    const ids: string[] = [];

    if (showAnnotations && data?.annotations) {
      const annotationRegions = annotationPageToRegions(data.annotations);
      ids.push(...annotationRegions.map(r => r.id));
      regions.push(
        ...annotationRegions.map(region => ({
          id: region.id,
          target: region.target,
          style:
            highlightedAnnotation === region.id || highlighted.indexOf(region.id) !== -1
              ? styles.highlighted
              : styles.contributedAnnotations,
        }))
      );
      //
    }

    return { regions, ids };
  }, [data, highlighted, highlightedAnnotation, showAnnotations, styles.contributedAnnotations, styles.highlighted]);

  const unstyledDocumentRegions = useMemo(() => {
    const regions: ReadOnlyAnnotation[] = [];
    const ids: string[] = [];

    if (showDocumentRegions) {
      if (data && data.models) {
        for (const model of data.models) {
          traverseDocument(model.document, {
            visitSelector(selector) {
              if (selector.state) {
                ids.push(selector.id);
                regions.push({
                  id: selector.id,
                  target: selector.state,
                  style: styles.contributedDocument,
                });
              }
            },
          });
        }
      }
    }

    return { regions, ids };
  }, [data, showDocumentRegions, styles.contributedDocument]);

  const documentRegions = useMemo(() => {
    const returnRegions = [];
    for (const region of unstyledDocumentRegions.regions) {
      if (region.id === highlightedDocumentRegion || highlighted.indexOf(region.id) !== -1) {
        returnRegions.push({ ...region, style: styles.highlighted });
      } else {
        returnRegions.push(region);
      }
    }
    return {
      regions: returnRegions,
      ids: unstyledDocumentRegions.ids,
    };
  }, [highlighted, highlightedDocumentRegion, styles.highlighted, unstyledDocumentRegions]);

  useEffect(() => {
    return controller.on('highlight', e => {
      if (annotations.ids.indexOf(e.selectorId) !== -1) {
        setHighlightedAnnotation(e.selectorId);
      }
      if (documentRegions.ids.indexOf(e.selectorId) !== -1) {
        setHighlightedDocumentRegion(e.selectorId);
      }
    });
  }, [annotations.ids, controller, documentRegions.ids]);

  useEffect(() => {
    return controller.on('clear-highlight', e => {
      if (e.selectorId === highlightedAnnotation) {
        setHighlightedAnnotation(null);
      }
      if (e.selectorId === highlightedDocumentRegion) {
        setHighlightedDocumentRegion(null);
      }
    });
  }, [controller, highlightedAnnotation, highlightedDocumentRegion]);

  return useMemo(() => {
    return [...annotations.regions, ...documentRegions.regions];
  }, [annotations, documentRegions]);
}

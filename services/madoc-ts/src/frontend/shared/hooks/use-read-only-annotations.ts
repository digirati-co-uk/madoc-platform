import { useEffect, useMemo, useState } from 'react';
import { AnnotationThemeDefinition } from '../../../types/annotation-styles';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { useProjectAnnotationStyles } from '../../site/hooks/use-project-annotation-styles';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { useSelectorController } from '../capture-models/editor/stores/selectors/selector-helper';
import { resolveSelector } from '../capture-models/helpers/resolve-selector';
import { traverseDocument } from '../capture-models/helpers/traverse-document';
import { apiHooks } from './use-api-query';
import { useHighlightedRegions } from './use-highlighted-regions';
import { useLocalStorage } from './use-local-storage';
import { annotationPageToRegions } from '../utility/annotation-page-to-regions';
import { useLoadedCaptureModel } from './use-loaded-capture-model';
import { useCanvasModel } from '../../site/hooks/use-canvas-model';
import { useUser } from './use-site';
import { PolygonSelectorProps } from '../capture-models/editor/selector-types/PolygonSelector/PolygonSelector';
export interface ReadOnlyAnnotation {
  id: string;
  target: { x: number; y: number; width: number; height: number } | PolygonSelectorProps['state'];
  style: AnnotationThemeDefinition;
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

  const { data: canvasModel } = useCanvasModel();
  const { data } = apiHooks.getSiteCanvasPublishedModels(
    () =>
      canvasId
        ? [canvasId, { project_id: projectId, selectors: true, format: 'capture-model-with-pages-resolved' }]
        : undefined,
    { refetchOnWindowFocus: false }
  );
  const [{ captureModel }] = useLoadedCaptureModel(canvasModel?.model?.id, undefined, canvasId);

  const modelPageShowAnnotations = config.project?.modelPageShowAnnotations || 'when-open';
  const modelPageShowDocument = config.project?.modelPageShowDocument || 'when-open';
  const canvasPageShowAnnotations = config.project?.canvasPageShowAnnotations || 'when-open';
  const canvasPageShowDocument = config.project?.canvasPageShowDocument || 'when-open';

  const showAnnotations = isModelPage
    ? modelPageShowAnnotations === 'always' ||
      (modelPageShowAnnotations === 'when-open' && isOpen && openPanel === 'annotations')
    : canvasPageShowAnnotations === 'always' ||
      (canvasPageShowAnnotations === 'when-open' && isOpen && openPanel === 'annotations');

  const isAnno = openPanel === 'document' || openPanel === 'revision-panel';
  const showDocumentRegions = isModelPage
    ? modelPageShowDocument === 'always' || (modelPageShowDocument === 'when-open' && isOpen && isAnno)
    : canvasPageShowDocument === 'always' || (canvasPageShowDocument === 'when-open' && isOpen && isAnno);

  const showRevisions = openPanel === 'revision-panel';

  const annotations = useMemo(() => {
    const regions: ReadOnlyAnnotation[] = [];
    const ids: string[] = [];

    if (showAnnotations && data?.annotations && !styles.contributedAnnotations?.hidden) {
      const annotationRegions = annotationPageToRegions(data.annotations);

      for (const region of annotationRegions) {
        if (ids.indexOf(region.id) !== -1) continue;
        ids.push(region.id);
        regions.push({
          id: region.id,
          target: region.target,
          style:
            highlightedAnnotation === region.id || highlighted.indexOf(region.id) !== -1
              ? styles.highlighted
              : styles.contributedAnnotations,
        });
      }
    }

    return { regions, ids };
  }, [data, highlighted, highlightedAnnotation, showAnnotations, styles.contributedAnnotations, styles.highlighted]);

  const unstyledDocumentRegions = useMemo(() => {
    const regions: ReadOnlyAnnotation[] = [];
    const ids: string[] = [...annotations.ids];

    if (showDocumentRegions && !styles.contributedDocument?.hidden) {
      if (data && data.models) {
        for (const model of data.models) {
          traverseDocument(model.document, {
            visitSelector(selector) {
              if (selector.state && ids.indexOf(selector.id) === -1) {
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
  }, [data, showDocumentRegions, styles.contributedDocument, annotations.ids]);

  // show users submitted regions
  const user = useUser();
  const revisions = captureModel?.revisions;
  const revisionIds = revisions?.map(r =>
    !r.approved && r.status !== 'rejected' && r.authors?.includes(`urn:madoc:user:${user?.id}`) ? r.id : ''
  );
  const rejectedIDs = revisions?.map(r =>
    !r.approved && r.status === 'rejected' && r.authors?.includes(`urn:madoc:user:${user?.id}`) ? r.id : ''
  );
  const unstyledRevisions = useMemo(() => {
    const regions: ReadOnlyAnnotation[] = [];
    const rIds: string[] = revisionIds ? [...revisionIds.filter(r => r)] : [];
    const rejIds: string[] = rejectedIDs ? [...rejectedIDs.filter(r => r)] : [];
    const ids: string[] = [];

    if (showRevisions && !styles.submissions?.hidden) {
      if (captureModel && captureModel.document) {
        traverseDocument(captureModel.document, {
          visitSelector(_selector, revision) {
            if (revision.revision) {
              const selector = resolveSelector(_selector, revision.revision);
              if (selector.state && rIds.indexOf(revision.revision) !== -1 && ids.indexOf(selector.id) === -1) {
                ids.push(selector.id);
                regions.push({
                  id: selector.id,
                  target: selector.state,
                  style: styles.submissions,
                });
              } else if (
                selector.state &&
                rejIds.indexOf(revision.revision) !== -1 &&
                ids.indexOf(selector.id) === -1
              ) {
                ids.push(selector.id);
                regions.push({
                  id: selector.id,
                  target: selector.state,
                  style: styles.adjacent,
                });
              }
            }
          },
        });
      }
    }
    return { regions, ids };
  }, [captureModel, rejectedIDs, revisionIds, showRevisions, styles.adjacent, styles.submissions]);

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

  const submittedDocumentRegions = useMemo(() => {
    const returnRegions = [];

    for (const region of unstyledRevisions.regions) {
      if (region.id === highlightedDocumentRegion || highlighted.indexOf(region.id) !== -1) {
        returnRegions.push({ ...region, style: styles.highlighted });
      } else {
        returnRegions.push(region);
      }
    }
    return {
      regions: returnRegions,
      ids: unstyledRevisions.ids,
    };
  }, [highlighted, highlightedDocumentRegion, styles.highlighted, unstyledRevisions]);

  useEffect(() => {
    return controller.on('highlight', e => {
      if (annotations.ids.indexOf(e.selectorId) !== -1) {
        setHighlightedAnnotation(e.selectorId);
      }
      if (documentRegions.ids.indexOf(e.selectorId) !== -1) {
        setHighlightedDocumentRegion(e.selectorId);
      }
      if (submittedDocumentRegions.ids.indexOf(e.selectorId) !== -1) {
        setHighlightedDocumentRegion(e.selectorId);
      }
    });
  }, [annotations.ids, controller, documentRegions.ids, submittedDocumentRegions.ids]);

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
    return [...annotations.regions, ...documentRegions.regions, ...submittedDocumentRegions.regions];
  }, [annotations.regions, documentRegions.regions, submittedDocumentRegions.regions]);
}

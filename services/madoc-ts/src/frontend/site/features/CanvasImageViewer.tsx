import { AnnotationPage } from '@hyperion-framework/types';
import React from 'react';
import { SimpleAtlasViewer } from '../../shared/components/SimpleAtlasViewer';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasImageViewer: React.FC<{ annotationPages?: AnnotationPage[] }> = ({ annotationPages }) => {
  const { canvasId } = useRouteContext();
  const [, highlightedRegions] = useCanvasSearch(canvasId);

  if (!canvasId) {
    return null;
  }

  return (
    <SimpleAtlasViewer
      unstable_webglRenderer
      style={{ height: '70vh', width: '100%' }}
      annotationPages={annotationPages}
      highlightedRegions={highlightedRegions ? highlightedRegions.bounding_boxes : undefined}
    />
  );
};

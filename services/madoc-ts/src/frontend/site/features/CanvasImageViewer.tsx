import { CanvasContext, useVaultEffect } from '@hyperion-framework/react-vault';
import { AnnotationPage, CanvasNormalized } from '@hyperion-framework/types';
import React, { useState } from 'react';
import { SimpleAtlasViewer } from '../../shared/components/SimpleAtlasViewer';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { useData } from '../../shared/hooks/use-data';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

export const CanvasImageViewer: React.FC<{ annotationPages?: AnnotationPage[] }> = ({ annotationPages }) => {
  const { canvasId } = useRouteContext();
  const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
  const { data: canvasResponse } = useData(CanvasLoader);
  const [, highlightedRegions] = useCanvasSearch(canvasId);
  // const {} = use
  const canvas = canvasResponse?.canvas;

  useVaultEffect(
    vault => {
      if (canvas && canvas.source) {
        vault
          .load(
            canvas.source.id || canvas.source['@id'],
            canvas.source['@id']
              ? {
                  '@context': 'http://iiif.io/api/presentation/2/context.json',
                  ...canvas.source,
                }
              : canvas.source
          )
          .then(c => {
            setCanvasRef(c as any);
          });
      }
    },
    [canvas]
  );

  if (!canvasRef) {
    return null;
  }

  return (
    <CanvasContext canvas={canvasRef.id}>
      <SimpleAtlasViewer
        style={{ height: '70vh', width: '100%' }}
        annotationPages={annotationPages}
        highlightedRegions={highlightedRegions ? highlightedRegions.bounding_boxes : undefined}
      />
    </CanvasContext>
  );
};

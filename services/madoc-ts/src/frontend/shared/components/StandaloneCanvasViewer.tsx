import { CanvasContext, useVaultEffect } from 'react-iiif-vault';
import { CanvasNormalized } from '@iiif/presentation-3';
import React, { useState } from 'react';
import { CanvasFull } from '../../../types/canvas-full';
import { useViewerHeight } from '../../site/hooks/use-viewer-height';
import { apiHooks } from '../hooks/use-api-query';
import { SimpleAtlasViewer } from './SimpleAtlasViewer';

export const CanvasViewer: React.FC<{ canvas: CanvasFull['canvas'] }> = ({ canvas }) => {
  const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
  const height = useViewerHeight();

  useVaultEffect(
    vault => {
      if (canvas) {
        vault.load(canvas.id, JSON.parse(JSON.stringify(canvas))).then(c => {
          setCanvasRef(c as any);
        });
      }
    },
    [canvas]
  );

  return (
    <>
      {canvasRef ? (
        <CanvasContext canvas={canvasRef.id}>
          <SimpleAtlasViewer style={{ height }} />
        </CanvasContext>
      ) : null}
    </>
  );
};

export function StandaloneCanvasViewer(props: { canvasId: number }) {
  const { data: canvas } = apiHooks.getCanvasById(() => (props.canvasId ? [props.canvasId] : undefined));

  return <>{canvas ? <CanvasViewer canvas={canvas.canvas} /> : null}</>;
}

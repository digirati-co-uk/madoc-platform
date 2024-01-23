import { CanvasContext, useVaultEffect } from 'react-iiif-vault';
import { CanvasNormalized } from '@iiif/presentation-3-normalized';
import React, { useState } from 'react';
import { CanvasFull } from '../../../types/canvas-full';
import { useViewerHeight } from '../../site/hooks/use-viewer-height';
import { apiHooks } from '../hooks/use-api-query';
import { SimpleAtlasViewer } from '../features/SimpleAtlasViewer';

export const CanvasViewer: React.FC<{ canvas: CanvasFull['canvas']; isModel?: boolean }> = ({ canvas, isModel }) => {
  const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
  const height = useViewerHeight();

  useVaultEffect(
    vault => {
      if (canvas) {
        const canvasJson = JSON.parse(JSON.stringify(canvas));
        canvasJson.id = canvasJson.source_id || canvasJson.id;
        vault.load(canvasJson.id, canvasJson).then(c => {
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
          <SimpleAtlasViewer style={{ height }} isModel={isModel} />
        </CanvasContext>
      ) : null}
    </>
  );
};

export function StandaloneCanvasViewer(props: { canvasId: number; isModel?: boolean }) {
  const { data: canvas } = apiHooks.getCanvasById(() => (props.canvasId ? [props.canvasId] : undefined));

  return <>{canvas ? <CanvasViewer canvas={canvas.canvas} isModel={props.isModel} /> : null}</>;
}

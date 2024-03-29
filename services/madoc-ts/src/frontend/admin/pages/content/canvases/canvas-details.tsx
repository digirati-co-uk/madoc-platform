import React, { useState } from 'react';
import { useViewerHeight } from '../../../../site/hooks/use-viewer-height';
import { UniversalComponent } from '../../../../types';
import { CanvasFull } from '../../../../../types/canvas-full';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { CanvasContext, useVaultEffect, VaultProvider } from 'react-iiif-vault';
import { CanvasNormalized } from '@iiif/presentation-3-normalized';
import { SimpleAtlasViewer } from '../../../../shared/features/SimpleAtlasViewer';

type CanvasDetailsType = {
  params: { id: number; manifestId: number };
  query: any;
  variables: { id: number };
  data: CanvasFull;
};

const CanvasViewer: React.FC<{ canvas: CanvasFull['canvas'] }> = ({ canvas }) => {
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
          <SimpleAtlasViewer style={{ height }} />
        </CanvasContext>
      ) : null}
    </>
  );
};

export const CanvasDetails: UniversalComponent<CanvasDetailsType> = createUniversalComponent<CanvasDetailsType>(
  () => {
    const { data, status } = useData(CanvasDetails);

    if (status === 'loading' || status === 'error' || !data) {
      return <div>Loading...</div>;
    }

    const { canvas } = data;

    return (
      <VaultProvider>
        {canvas ? <CanvasViewer canvas={canvas} /> : null}
        <div>
          Dimensions: {canvas.width} x {canvas.height}
        </div>
      </VaultProvider>
    );
  },
  {
    getKey: params => {
      return ['view-canvas', { id: params.id }];
    },
    getData: async (key, vars, api) => {
      return await api.getCanvasById(vars.id);
    },
  }
);

import React, { useState } from 'react';
import { UniversalComponent } from '../../../../types';
import { CanvasFull } from '../../../../../types/schemas/canvas-full';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { CanvasContext, useVaultEffect, VaultProvider } from '@hyperion-framework/react-vault';
import { CanvasNormalized } from '@hyperion-framework/types';
import { SimpleAtlasViewer } from '../../../../shared/components/SimpleAtlasViewer';

type CanvasDetailsType = {
  params: { id: number; manifestId: number };
  query: {};
  variables: { id: number };
  data: CanvasFull;
};

const CanvasViewer: React.FC<{ canvas: CanvasFull['canvas'] }> = ({ canvas }) => {
  const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();

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
          <SimpleAtlasViewer style={{ height: '70vh' }} unstable_webglRenderer />
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

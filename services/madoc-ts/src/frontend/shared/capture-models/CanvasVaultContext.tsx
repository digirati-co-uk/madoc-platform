import { CanvasContext, useVault } from 'react-iiif-vault';
import { CanvasNormalized } from '@iiif/presentation-3-normalized';
import React, { useEffect, useState } from 'react';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { CanvasLoader } from '../../site/pages/loaders/canvas-loader';
import { useData } from '../hooks/use-data';

export const CanvasVaultContext: React.FC = ({ children }: { children?: React.ReactNode; }) => {
  const vault = useVault();
  const { canvasId } = useRouteContext();
  const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
  const { data: canvasResponse } = useData(CanvasLoader, [canvasId], { enabled: !!canvasId });
  const canvas = canvasResponse?.canvas;
  useEffect(() => {
    if (canvas && canvas.items) {
      try {
        const clonedCanvas = JSON.parse(JSON.stringify(canvas));

        clonedCanvas.id = clonedCanvas.source_id || clonedCanvas.id;

        vault.load({ id: clonedCanvas.id } as any, clonedCanvas).then((c: any) => {
          setCanvasRef(c as any);
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, [vault, canvas]);

  if (!canvasRef) {
    return <>{children}</>;
  }

  return <CanvasContext canvas={canvasRef.id}>{children}</CanvasContext>;
};

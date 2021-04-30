import { CanvasContext, useVaultEffect } from '@hyperion-framework/react-vault';
import { CanvasNormalized } from '@hyperion-framework/types';
import React, { useState } from 'react';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { CanvasLoader } from '../../site/pages/loaders/canvas-loader';
import { useData } from '../hooks/use-data';

export const CanvasVaultContext: React.FC = ({ children }) => {
  const { canvasId } = useRouteContext();
  const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
  const { data: canvasResponse } = useData(CanvasLoader, undefined, { enabled: !!canvasId });
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
    return <>{children}</>;
  }

  return <CanvasContext canvas={canvasRef.id}>{children}</CanvasContext>;
};

import { Preset } from '@atlas-viewer/atlas';
import React, { useMemo } from 'react';
import '../capture-models/editor/content-types/Atlas';
import { CanvasFull } from '../../../types/canvas-full';
import { useContentType } from '../capture-models/plugin-api/hooks/use-content-type';
import { Target } from '../capture-models/types/capture-model';

export const ViewContent: React.FC<{
  target: Target[];
  canvas: CanvasFull['canvas'];
  height?: number;
  onCreated?: (runtime: Preset) => void;
  onPanInSketchMode?: () => void;
}> = ({ target, canvas, height = 600, onCreated, onPanInSketchMode, children }) => {
  return useContentType(
    useMemo(() => {
      const fixedType = [];
      const collectionType = target.find(item => item && item.type.toLowerCase() === 'collection');
      const manifestType = target.find(item => item && item.type.toLowerCase() === 'manifest');
      const canvasType = target.find(item => item && item.type.toLowerCase() === 'canvas');

      if (collectionType) {
        fixedType.push({ type: 'Collection', id: collectionType.id });
      }
      if (manifestType) {
        fixedType.push({ type: 'Manifest', id: manifestType.id });
      }
      if (canvasType) {
        fixedType.push({ type: 'Canvas', id: canvasType.id });
      }
      return fixedType;
    }, [target]),
    useMemo(
      () => ({
        height,
        custom: {
          controllerConfig: {
            onPanInSketchMode,
          },
          onCreateAtlas: onCreated,
          customFetcher: (mid: string) => {
            const canvasTarget: any = target.find((r: any) => r.type === 'Canvas');
            return {
              '@context': 'http://iiif.io/api/presentation/3/context.json',
              id: `${mid}`,
              type: 'Manifest',
              items: [{ ...JSON.parse(JSON.stringify(canvas)), id: `${canvasTarget.id}` }],
            };
          },
        },
      }),
      [onPanInSketchMode, height, canvas, target]
    ),
    children as any
  );
};

import React, { useMemo } from 'react';
import { useContentType } from '@capture-models/plugin-api';
import { Target } from '@capture-models/types';
import '@capture-models/editor/lib/content-types/Atlas';

export const ViewContent: React.FC<{ target: Target[]; canvas: any; height?: number }> = ({
  target,
  canvas,
  height = 600,
  children,
}) => {
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
          customFetcher: (mid: string) => {
            const canvasTarget: any = target.find((r: any) => r.type === 'Canvas');
            return {
              '@context': 'http://iiif.io/api/presentation/2/context.json',
              '@id': `${mid}`,
              '@type': 'sc:Manifest',
              sequences: [
                {
                  '@id': `${mid}/s1`,
                  '@type': 'sc:Sequence',
                  canvases: [{ ...canvas.source, '@id': `${canvasTarget.id}` }],
                },
              ],
            };
          },
        },
      }),
      [canvas.source, target]
    ),
    children as any
  );
};

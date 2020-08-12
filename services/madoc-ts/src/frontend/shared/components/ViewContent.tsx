import React, { useMemo } from 'react';
import { useContentType } from '@capture-models/plugin-api';

export const ViewContent: React.FC<{ target: any; canvas: any }> = ({ target, canvas }) => {
  return useContentType(
    useMemo(
      () =>
        [...target].reverse().map((r: any) => {
          return { ...r, type: r.type.toLowerCase() };
        }),
      [target]
    ),
    useMemo(
      () => ({
        height: 600,
        custom: {
          customFetcher: (mid: string) => {
            const canvasTarget = target.find((r: any) => r.type === 'Canvas');
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
    )
  );
};

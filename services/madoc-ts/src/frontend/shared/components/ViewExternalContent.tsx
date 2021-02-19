import { AtlasContextType } from '@atlas-viewer/atlas';
import React, { useMemo } from 'react';
import { useContentType } from '@capture-models/plugin-api';

export const ViewExternalContent: React.FC<{
  target: any;
  height?: number;
  onCreated?: (runtime: AtlasContextType) => void;
}> = ({ target, children, onCreated, height = 600 }) => {
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
        height,
        children,
        custom: {
          onCreateAtlas: onCreated,
        },
      }),
      [onCreated, children, height]
    )
  );
};

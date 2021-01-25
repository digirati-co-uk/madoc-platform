import React, { useMemo } from 'react';
import { useContentType } from '@capture-models/plugin-api';

export const ViewExternalContent: React.FC<{ target: any; height?: number }> = ({ target, height = 600 }) => {
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
      }),
      [target]
    )
  );
};

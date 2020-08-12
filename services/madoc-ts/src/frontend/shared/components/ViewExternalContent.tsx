import React, { useMemo } from 'react';
import { useContentType } from '@capture-models/plugin-api';

export const ViewExternalContent: React.FC<{ target: any }> = ({ target }) => {
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
      }),
      [target]
    )
  );
};

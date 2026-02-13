import { Preset } from '@atlas-viewer/atlas';
import React, { useMemo } from 'react';
import { useSiteConfiguration } from '../../../site/features/SiteConfigurationContext';
import { useContentType } from '../plugin-api/hooks/use-content-type';

export const ViewExternalContent: React.FC<{
  target: any;
  height?: number;
  onCreated?: (runtime: Preset) => void;
  onPanInSketchMode?: () => void;
  children?: React.ReactNode;
}> = ({ target, children, onCreated, onPanInSketchMode, height = 600 }) => {
  const {
    project: { atlasBackground },
  } = useSiteConfiguration();

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
          onPanInSketchMode,
          onCreateAtlas: onCreated,
          backgroundColor: atlasBackground,
        },
      }),
      [onPanInSketchMode, onCreated, children, height]
    )
  );
};

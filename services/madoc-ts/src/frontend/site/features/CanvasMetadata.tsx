import React from 'react';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';
import { useData } from '../../shared/hooks/use-data';
import { useSiteMetadataConfiguration } from '../../shared/hooks/use-site-metadata-configuration';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

export const CanvasMetadata: React.FC<{ compact?: boolean; showEmptyMessage?: boolean }> = ({
  compact,
  showEmptyMessage,
}) => {
  const { manifestId, canvasId } = useRouteContext();
  const { data } = useData(CanvasLoader, [], { enabled: !!(canvasId && manifestId) });
  const { data: metadataConfig } = useSiteMetadataConfiguration();

  if (!data || !metadataConfig) {
    return null;
  }

  const metadata = data.canvas.metadata;

  if (!metadata || !metadata.length) {
    return null;
  }

  return (
    <MetaDataDisplay
      variation={compact ? 'list' : 'table'}
      config={metadataConfig?.metadata}
      metadata={metadata || []}
      showEmptyMessage={showEmptyMessage}
    />
  );
};

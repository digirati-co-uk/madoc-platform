import React from 'react';
import { useRouteContext } from '../hooks/use-route-context';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { CollectionLoader } from '../pages/loaders/collection-loader';
import { useSiteMetadataConfiguration } from '../../shared/hooks/use-site-metadata-configuration';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';

export const CollectionMetadata: React.FC<{ compact?: boolean; showEmptyMessage?: boolean }> = ({
  compact,
  showEmptyMessage,
}) => {
  const { collectionId } = useRouteContext();
  const { resolvedData: data } = usePaginatedData(CollectionLoader, undefined, { enabled: !!collectionId });
  const { data: metadataConfig } = useSiteMetadataConfiguration();

  if (!data || !metadataConfig) {
    return null;
  }

  const metadata = data.collection.metadata;

  if (!metadata || !metadata.length) {
    return null;
  }

  return (
    <MetaDataDisplay
      variation={compact ? 'list' : 'table'}
      config={undefined}
      metadata={metadata || []}
      showEmptyMessage={showEmptyMessage}
    />
  );
};

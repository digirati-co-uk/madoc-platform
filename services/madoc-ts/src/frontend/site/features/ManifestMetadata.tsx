import React from 'react';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useSiteMetadataConfiguration } from '../../shared/hooks/use-site-metadata-configuration';
import { Spinner } from '../../shared/icons/Spinner';
import { useRouteContext } from '../hooks/use-route-context';
import { ManifestLoader } from '../pages/loaders/manifest-loader';

export const ManifestMetadata: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { manifestId } = useRouteContext();
  const { resolvedData: data } = usePaginatedData(ManifestLoader, undefined, { enabled: !!manifestId });
  const { data: metadataConfig, isLoading } = useSiteMetadataConfiguration();

  if (isLoading) {
    return (
      <div style={{ width: '40%', backgroundColor: '#ebebeb', padding: '2em 0', textAlign: 'center' }}>
        <Spinner stroke={'#000'} />
      </div>
    );
  }

  if (!data || !metadataConfig) {
    return null;
  }

  const metadata = data.manifest.metadata;

  if (!metadata || !metadata.length) {
    return null;
  }

  return (
    <MetaDataDisplay
      variation={compact ? 'list' : 'table'}
      config={metadataConfig?.metadata}
      metadata={metadata || []}
    />
  );
};

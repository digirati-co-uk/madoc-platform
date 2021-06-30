import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useSiteMetadataConfiguration } from '../../shared/hooks/use-site-metadata-configuration';
import { useRouteContext } from '../hooks/use-route-context';
import { ManifestLoader } from '../pages/loaders/manifest-loader';

export const ManifestMetadata: React.FC<{ compact?: boolean; showEmptyMessage?: boolean }> = ({
  compact = true,
  showEmptyMessage,
}) => {
  const { manifestId } = useRouteContext();
  const { resolvedData: data } = usePaginatedData(ManifestLoader, undefined, { enabled: !!manifestId });
  const { data: metadataConfig } = useSiteMetadataConfiguration();

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
      showEmptyMessage={showEmptyMessage}
    />
  );
};

blockEditorFor(ManifestMetadata, {
  type: 'default.ManifestMetadata',
  label: 'Manifest metadata',
  anyContext: ['manifest', 'canvas'],
  requiredContext: ['manifest'],
  editor: {
    compact: { type: 'checkbox-field', inlineLabel: 'Show as compact', label: 'Display options' },
    showEmptyMessage: { type: 'checkbox-field', inlineLabel: 'Show empty message', label: 'Empty message' },
  },
  defaultProps: {
    compact: true,
    showEmptyMessage: false,
  },
});

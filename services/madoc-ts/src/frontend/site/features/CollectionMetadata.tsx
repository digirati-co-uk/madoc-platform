import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useMetadataSuggestionConfiguration } from '../hooks/use-metadata-suggestion-configuration';
import { useRelativeLinks } from '../hooks/use-relative-links';
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
  const createLink = useRelativeLinks();
  const { collection } = useMetadataSuggestionConfiguration();

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
      suggestEdit={
        collection ? createLink({ canvasId: undefined, manifestId: undefined, subRoute: `metadata/edit` }) : undefined
      }
    />
  );
};

blockEditorFor(CollectionMetadata, {
    type: 'default.CollectionMetadata',
    label: 'Collection metadata',
    anyContext: ['collection'],
    requiredContext: ['collection'],
    editor: {},
});

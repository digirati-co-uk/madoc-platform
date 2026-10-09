import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useMetadataSuggestionConfiguration } from '../hooks/use-metadata-suggestion-configuration';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { CollectionLoader } from '../pages/loaders/collection-loader';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';

interface CollectionMetadataProps {
  compact?: boolean;
  showEmptyMessage?: boolean;
}

export function CollectionMetadata({ compact, showEmptyMessage }: CollectionMetadataProps) {
  const { collectionId } = useRouteContext();
  const { resolvedData: data } = usePaginatedData(CollectionLoader, undefined, { enabled: !!collectionId });
  const createLink = useRelativeLinks();
  const { collection } = useMetadataSuggestionConfiguration();

  if (!data) {
    return null;
  }

  const metadata = data.collection.metadata;

  if (!metadata || !metadata.length) {
    return null;
  }

  return (
    <MetaDataDisplay
      variation={compact ? 'list' : 'table'}
      metadata={metadata}
      showEmptyMessage={showEmptyMessage}
      suggestEdit={
        collection ? createLink({ canvasId: undefined, manifestId: undefined, subRoute: `metadata/edit` }) : undefined
      }
    />
  );
}

blockEditorFor(CollectionMetadata, {
  type: 'default.CollectionMetadata',
  label: 'Collection metadata',
  anyContext: ['collection'],
  requiredContext: ['collection'],
  editor: {},
});

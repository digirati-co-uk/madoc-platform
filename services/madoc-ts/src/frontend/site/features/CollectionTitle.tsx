import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { LocaleString } from '../../shared/components/LocaleString';
import { usePaginatedCollection } from '../hooks/use-paginated-collection';

export const CollectionTitle: React.FC = () => {
  const { data } = usePaginatedCollection();
  const collection = data?.collection;

  if (!collection) {
    return null;
  }

  return <LocaleString as="h1">{collection.label}</LocaleString>;
};

blockEditorFor(CollectionTitle, {
  label: 'Collection title',
  editor: {},
  requiredContext: ['collection'],
  type: 'default.CollectionTitle',
});

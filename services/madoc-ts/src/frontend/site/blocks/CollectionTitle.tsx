import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { LocaleString } from '../../shared/components/LocaleString';
import { Heading1 } from '../../shared/typography/Heading1';
import { usePaginatedCollection } from '../hooks/use-paginated-collection';

export const CollectionTitle: React.FC = () => {
  const { data } = usePaginatedCollection();
  const collection = data?.collection;

  if (!collection) {
    return <Heading1>{'...'}</Heading1>;
  }

  return <LocaleString as={Heading1}>{collection.label}</LocaleString>;
};

blockEditorFor(CollectionTitle, {
  label: 'Collection title',
  editor: {},
  requiredContext: ['collection'],
  type: 'default.CollectionTitle',
});

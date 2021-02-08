import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { LocaleString } from '../../shared/components/LocaleString';
import { useStaticData } from '../../shared/hooks/use-data';
import { useRouteContext } from '../hooks/use-route-context';
import { CollectionLoader } from '../pages/loaders/collection-loader';

export const CollectionTitle: React.FC = () => {
  const { collectionId } = useRouteContext();
  const { data } = useStaticData(CollectionLoader, undefined, { enabled: !!collectionId });
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

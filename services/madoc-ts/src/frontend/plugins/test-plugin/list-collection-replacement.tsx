import { CollectionListLoader } from '../../site/pages/loaders/collection-list-loader';
import { RouteComponents } from '../../site/routes';
import React from 'react';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { Link } from 'react-router-dom';
import { LocaleString } from '../../shared/components/LocaleString';

export const ListCollectionsReplacement: RouteComponents['AllCollections'] = () => {
  const { resolvedData: data } = usePaginatedData(CollectionListLoader);

  if (!data) {
    return <div>loading...</div>;
  }

  return (
    <div>
      All collections from plugin.
      <h1>All collections</h1>
      {data.collections.map(collection => {
        return (
          <div key={collection.id}>
            <Link to={`/collections/${collection.id}`}>
              <LocaleString>{collection.label}</LocaleString>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

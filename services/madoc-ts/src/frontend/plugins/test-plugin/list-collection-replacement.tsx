import { PluginPageComponent } from '../../shared/plugins/external/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { LocaleString } from '../../shared/components/LocaleString';

export const ListCollectionsReplacement: PluginPageComponent<any> = ({ loader }) => {
  const { resolvedData: data } = loader.useCollectionList();

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

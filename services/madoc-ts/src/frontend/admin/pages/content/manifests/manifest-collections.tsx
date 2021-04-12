import React from 'react';
import { CollectionSnippet } from '../../../../shared/components/CollectionSnippet';
import { SmallButton } from '../../../../shared/atoms/Button';
import { Link } from 'react-router-dom';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type ManifestCollectionsType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: { collections: number[] };
};

export const ManifestCollections = createUniversalComponent<ManifestCollectionsType>(
  () => {
    const { data } = useData(ManifestCollections);

    if (!data) {
      return <div>loading...</div>;
    }

    const { collections } = data;

    if (collections.length === 0) {
      return (
        <div>
          <h4>This manifest is not in any collections</h4>
          <SmallButton as={Link} to={`/collections`}>
            Go to collections
          </SmallButton>
        </div>
      );
    }

    return (
      <div>
        <h2>Collections</h2>
        <p>This manifest is in the following collections.</p>
        <hr />
        {collections.map(collection => (
          <CollectionSnippet id={collection} />
        ))}
      </div>
    );
  },
  {
    getKey: params => {
      return ['manifest-collections', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      return api.getManifestCollections(id, { flat: false });
    },
  }
);

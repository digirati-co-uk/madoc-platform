import { UniversalComponent } from '../../../types';
import { useState } from 'react';
import React from 'react';
import { useVaultEffect, VaultProvider } from '@hyperion-framework/react-vault';
import { CollectionNormalized, ManifestNormalized } from '@hyperion-framework/types';

const PreviewCollection: React.FC<{ id: string }> = props => {
  const [collection, setCollection] = useState<CollectionNormalized | undefined>();
  const [manifests, setManifests] = useState<ManifestNormalized[]>([]);

  useVaultEffect(
    vault => {
      vault.loadCollection(props.id).then(col => {
        setCollection(col);
        setManifests(
          col.items.map(man => {
            return vault.fromRef(man);
          })
        );
      });
    },
    [props.id]
  );

  if (!collection) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h4>{collection.label && collection.label.en ? collection.label.en.join('') : 'Untitled'}</h4>
      {manifests.map((man, key) => {
        return <div key={key}>{man.label && man.label.en ? man.label.en.join('') : 'Untitled'}</div>;
      })}
    </div>
  );
};

export const ImportCollection: UniversalComponent<{}> = () => {
  const [collectionUrl, setCollectionUrl] = useState('');
  const [collectionId, setCollectionId] = useState('');

  return (
    <div>
      <h1>Create collection</h1>
      <input type="text" value={collectionUrl} onChange={e => setCollectionUrl(e.currentTarget.value)} />
      <button onClick={() => setCollectionId(collectionUrl)}>Choose</button>
      <VaultProvider>{collectionId ? <PreviewCollection id={collectionId} /> : null}</VaultProvider>
    </div>
  );
};

ImportCollection.getData = async () => {
  return {};
};

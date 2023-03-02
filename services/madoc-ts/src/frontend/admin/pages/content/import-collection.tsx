import { useTranslation } from 'react-i18next';
import { UniversalComponent } from '../../../types';
import React, { useState } from 'react';
import { useVaultEffect, VaultProvider } from 'react-iiif-vault';
import { CollectionNormalized, ManifestNormalized } from '@iiif/presentation-3';

const PreviewCollection: React.FC<{ id: string }> = props => {
  const [collection, setCollection] = useState<CollectionNormalized | undefined>();
  const [manifests, setManifests] = useState<ManifestNormalized[]>([]);

  useVaultEffect(
    vault => {
      vault.loadCollection(props.id).then(col => {
        setCollection(col);
        if (col) {
          setManifests(
            col.items.map(man => {
              return vault.get(man);
            })
          );
        }
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
  const { t } = useTranslation();
  const [collectionUrl, setCollectionUrl] = useState('');
  const [collectionId, setCollectionId] = useState('');

  return (
    <div>
      <h1>Create collection</h1>
      <input
        type="text"
        name="collection_url"
        value={collectionUrl}
        onChange={e => setCollectionUrl(e.currentTarget.value)}
      />
      <button onClick={() => setCollectionId(collectionUrl)}>{t('Choose')}</button>
      <VaultProvider>{collectionId ? <PreviewCollection id={collectionId} /> : null}</VaultProvider>
    </div>
  );
};

ImportCollection.getData = async () => {
  return {};
};

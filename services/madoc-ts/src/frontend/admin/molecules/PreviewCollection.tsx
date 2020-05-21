import React, { useState } from 'react';
import { CollectionNormalized, ManifestNormalized } from '@hyperion-framework/types';
import { useVaultEffect } from '@hyperion-framework/react-vault';
import { LocaleString } from './LocaleString';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../atoms/Table';
import { Button, TinyButton } from '../atoms/Button';
import { Header } from '../atoms/Header';
import { Heading1 } from '../atoms/Heading1';
import { useTranslation } from 'react-i18next';
import { PreviewManifest } from './PreviewManifest';

export const PreviewCollection: React.FC<{
  id: string;
  disabled?: boolean;
  onImport: (collectionId: string, manifestIds: string[]) => void;
}> = props => {
  const [collection, setCollection] = useState<CollectionNormalized | undefined>();
  const [manifests, setManifests] = useState<ManifestNormalized[]>([]);
  const { t } = useTranslation();
  const [currentManifest, setCurrentManifest] = useState<string>();
  const [excludedManifests, setExcludedManifests] = useState<string[]>([]);

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
    return <div>{t('loading')}</div>;
  }

  return (
    <div>
      {currentManifest ? (
        <>
          <PreviewManifest id={currentManifest} />
        </>
      ) : null}
      <br />

      <Header>
        <Heading1>
          <LocaleString>{collection.label || { none: [t('Untitled collection')] }}</LocaleString>
        </Heading1>
        <Button
          disabled={excludedManifests.length === manifests.length || props.disabled}
          onClick={() => {
            props.onImport(
              collection.id,
              manifests.map(m => m.id).filter(id => excludedManifests.indexOf(id) === -1)
            );
          }}
        >
          {t('Import collection and {{count}} manifests', { count: manifests.length - excludedManifests.length })}
        </Button>
      </Header>
      <TableContainer>
        {manifests.map(manifest => {
          return (
            <TableRow key={manifest.id}>
              <TableRowLabel>
                <LocaleString>{manifest.label || { none: ['Untitled manifest'] }}</LocaleString>
              </TableRowLabel>
              <TableActions>
                {excludedManifests.indexOf(manifest.id) !== -1 ? (
                  <TinyButton
                    disabled={props.disabled}
                    onClick={() => setExcludedManifests(m => m.filter(id => id !== manifest.id))}
                  >
                    {t('add to import')}
                  </TinyButton>
                ) : (
                  <TinyButton disabled={props.disabled} onClick={() => setExcludedManifests(m => [...m, manifest.id])}>
                    {t('exclude')}
                  </TinyButton>
                )}
                <TinyButton
                  disabled={props.disabled}
                  style={{ marginLeft: 10 }}
                  onClick={() => setCurrentManifest(manifest.id)}
                >
                  {t('preview')}
                </TinyButton>
              </TableActions>
            </TableRow>
          );
        })}
      </TableContainer>
    </div>
  );
};

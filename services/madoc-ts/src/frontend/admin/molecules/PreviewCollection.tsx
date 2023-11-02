import React, { useState } from 'react';
import { CollectionNormalized, ManifestNormalized } from '@iiif/presentation-3';
import { useVaultEffect } from 'react-iiif-vault';
import { LocaleString } from '../../shared/components/LocaleString';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../shared/layout/Table';
import { Button, SmallButton } from '../../shared/navigation/Button';
import { Header } from '../../shared/atoms/Header';
import { Heading1 } from '../../shared/typography/Heading1';
import { useTranslation } from 'react-i18next';
import { PreviewManifest } from './PreviewManifest';

export const PreviewCollection: React.FC<{
  id?: string;
  manifestIds?: string[];
  manifestId?: string;
  disabled?: boolean;
  onClick?: (manifestId: string, type: string) => void;
  onImport?: (collectionId: string, manifestIds: string[]) => void;
  disableManifestPreview?: boolean;
}> = props => {
  const [collection, setCollection] = useState<CollectionNormalized | undefined>();
  const [manifests, setManifests] = useState<ManifestNormalized[]>([]);
  const { t } = useTranslation();
  const [currentManifest, setCurrentManifest] = useState<string | undefined>(props.manifestId);
  const [excludedManifests, setExcludedManifests] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const excludeEnabled = true;

  useVaultEffect(
    vault => {
      if (props.id) {
        vault.loadCollection(props.id).then(col => {
          if (col?.type !== 'Collection') {
            setError('Invalid collection');
            return;
          }

          if (col) {
            setCollection(col);
            setManifests(vault.get(col.items));
          } else {
            // error?
          }
        });
      }
    },
    [props.id]
  );

  useVaultEffect(
    async vault => {
      if (props.manifestIds && props.manifestIds.length) {
        const mans: ManifestNormalized[] = [];
        await Promise.all(
          props.manifestIds.map(async id => {
            await vault.loadManifest(id).then(man => {
              if (man?.type !== 'Manifest') {
                setError('Invalid manifest');
              } else {
                mans.push(man);
              }
            });
          })
        );
        setManifests(mans);
      }
    },
    [props.manifestIds]
  );

  if (error) {
    return <div>{t('Invalid collection')}</div>;
  }

  if (!collection && !props.manifestIds) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div>
      <Header>
        {collection ? (
          <Heading1>
            <LocaleString>{collection.label || { none: [t('Untitled collection')] }}</LocaleString>
          </Heading1>
        ) : null}
        {props.onImport ? (
          <Button
            disabled={excludedManifests.length === manifests.length || props.disabled}
            onClick={() => {
              if (props.onImport) {
                props.onImport(
                  collection?.id || '',
                  manifests.map(m => m.id).filter(id => excludedManifests.indexOf(id) === -1)
                );
              }
            }}
          >
            {collection
              ? t('Import collection and {{count}} manifests', { count: manifests.length - excludedManifests.length })
              : t('Import {{count}} manifests', { count: manifests.length - excludedManifests.length })}
          </Button>
        ) : null}
      </Header>

      {currentManifest && !props.disableManifestPreview ? (
        <div style={{ background: '#ddd', padding: '0.1em 1em' }}>
          <PreviewManifest id={currentManifest} />
        </div>
      ) : null}

      <TableContainer>
        {manifests.map(manifest => {
          return (
            <TableRow key={manifest.id}>
              <TableRowLabel>
                <LocaleString>
                  {manifest.label || (props.manifestIds ? { none: [manifest.id] } : { none: ['Untitled manifest'] })}
                </LocaleString>
              </TableRowLabel>
              <TableActions>
                {excludeEnabled ? (
                  excludedManifests.indexOf(manifest.id) !== -1 ? (
                    <SmallButton
                      disabled={props.disabled}
                      onClick={() => setExcludedManifests(m => m.filter(id => id !== manifest.id))}
                    >
                      {t('add to import')}
                    </SmallButton>
                  ) : (
                    <SmallButton
                      disabled={props.disabled}
                      onClick={() => setExcludedManifests(m => [...m, manifest.id])}
                    >
                      {t('exclude')}
                    </SmallButton>
                  )
                ) : null}
                <SmallButton
                  disabled={props.disabled}
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    setCurrentManifest(manifest.id);
                    if (props.onClick) {
                      props.onClick(manifest.id, manifest.type);
                    }
                  }}
                >
                  {t('Preview')}
                </SmallButton>
              </TableActions>
            </TableRow>
          );
        })}
      </TableContainer>
    </div>
  );
};

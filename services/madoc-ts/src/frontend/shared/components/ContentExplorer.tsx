import React, { useCallback, useEffect, useState } from 'react';
import { Button, TinyButton } from '../navigation/Button';
import { useAutocomplete } from '../hooks/use-autocomplete';
import { Input, InputContainer, InputLabel } from '../form/Input';
import { ExpandGrid, GridContainer } from '../layout/Grid';
import { useTranslation } from 'react-i18next';
import { Heading3 } from '../typography/Heading3';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../layout/Table';
import { CollectionExplorer } from './CollectionExplorer';
import { LocaleString } from './LocaleString';
import { ImageGrid, ImageGridItem } from '../atoms/ImageGrid';
import { CroppedImage } from '../atoms/Images';
import { SingleLineHeading5 } from '../typography/Heading5';
import styled from 'styled-components';
import { useRecent } from '../hooks/use-recent';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { PreviewManifest } from '../../admin/molecules/PreviewManifest';
import { PreviewCollection } from '../../admin/molecules/PreviewCollection';
import { useVault } from '@hyperion-framework/react-vault';

const ExplorerBackground = styled.div`
  background: #eee;
  padding: 1em;
`;

export const URLContextExplorer: React.FC<{
  renderChoice: (id: string, manifestId: string, reset: () => void) => any;
  defaultResource?: { type: 'Collection' | 'Manifest'; id: string };
}> = ({ renderChoice, defaultResource }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [collectionId, setCollectionId] = useState<string | undefined>();
  const [manifestId, setManifestId] = useState<string | undefined>();
  const [canvasId, setCanvasId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const vault = useVault();

  useEffect(() => {
    if (defaultResource) {
      if (defaultResource.type === 'Collection') {
        setCollectionId(defaultResource.id);
      }
      if (defaultResource.type === 'Manifest') {
        setManifestId(defaultResource.id);
      }
    }
  }, [defaultResource]);

  const resetCanvas = useCallback(() => setCanvasId(undefined), []);

  if (canvasId && manifestId) {
    return renderChoice(canvasId, manifestId, resetCanvas);
  }

  if (manifestId) {
    return (
      <>
        <TinyButton onClick={() => setManifestId(undefined)}>Back to search</TinyButton>
        <PreviewManifest id={manifestId} onClick={id => setCanvasId(id)} />
      </>
    );
  }

  if (collectionId) {
    return (
      <>
        <TinyButton onClick={() => setCollectionId(undefined)}>Back to search</TinyButton>
        <PreviewCollection
          id={collectionId}
          onClick={(id, type) => {
            if (type === 'Manifest') {
              setManifestId(id);
            } else {
              setCollectionId(id);
            }
          }}
          disableManifestPreview
        />
      </>
    );
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (search) {
          setIsLoading(true);
          vault
            .load(search)
            .then((resource: any) => {
              if (resource.type === 'Collection') {
                setCollectionId(resource.id);
              }
              if (resource.type === 'Manifest') {
                setManifestId(resource.id);
              }
              // @todo error?
              setIsLoading(false);
            })
            .catch(err => {
              console.log(err);
              setIsLoading(false);
            });
        }
      }}
    >
      <InputContainer wide>
        <InputLabel>{t('Enter IIIF Manifest Collection URL')}</InputLabel>
        <GridContainer>
          <ExpandGrid>
            <Input placeholder={t('Enter URL')} type="text" onChange={e => setSearch(e.currentTarget.value)} />
          </ExpandGrid>
          <Button type="submit" disabled={isLoading}>
            {t('Open')}
          </Button>
        </GridContainer>
      </InputContainer>
    </form>
  );
};

export const ContentExplorer: React.FC<{
  canvasId?: number;
  projectId?: string;
  renderChoice: (id: number, reset: () => void) => any;
}> = ({ projectId, renderChoice, canvasId: defaultCanvasId }) => {
  const [recent, addNewRecent] = useRecent<ItemStructureListItem>('content-explorer');
  const { t } = useTranslation();
  const [contentType, setContentType] = useState<'collection' | 'manifest' | undefined>();
  const [search, setSearch] = useState<string>('');
  const [performSearch, type, searchResults] = useAutocomplete(search, { project: projectId });

  const [collectionId, setCollectionId] = useState<number | undefined>();
  const [manifestId, setManifestId] = useState<number | undefined>();
  const [canvasId, setCanvasId] = useState<number | undefined>(defaultCanvasId);

  const resetCanvas = useCallback(() => setCanvasId(undefined), []);

  useEffect(() => {
    setCanvasId(defaultCanvasId);
  }, [defaultCanvasId]);

  if (canvasId) {
    return renderChoice(canvasId, resetCanvas);
  }

  if (manifestId) {
    return (
      <ExplorerBackground>
        <CollectionExplorer
          id={manifestId}
          type="manifest"
          onChoose={(id, item) => {
            setCanvasId(id);
            if (!recent.find(i => i.id === item.id)) {
              addNewRecent({ ...item, type: 'canvas' });
            }
          }}
        />
      </ExplorerBackground>
    );
  }

  if (collectionId) {
    return (
      <ExplorerBackground>
        <CollectionExplorer
          id={collectionId}
          type="collection"
          onChoose={(id, item) => {
            setManifestId(id);
            if (!recent.find(i => i.id === item.id)) {
              addNewRecent({ ...item, type: 'manifest' });
            }
          }}
        />
      </ExplorerBackground>
    );
  }

  if (!contentType) {
    return (
      <ExplorerBackground>
        <h3>Choose type of content</h3>
        <Button onClick={() => setContentType('collection')}>{t('Collection')}</Button> |{' '}
        <Button onClick={() => setContentType('manifest')}>{t('Manifest')}</Button>
        {recent.length ? (
          <>
            <h4>{t('Recent items')}</h4>

            <ImageGrid>
              {recent.map(item => {
                return (
                  <ImageGridItem
                    $size="small"
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'collection') {
                        setCollectionId(item.id);
                      }
                      if (item.type === 'manifest') {
                        setManifestId(item.id);
                      }
                      if (item.type === 'canvas') {
                        setCanvasId(item.id);
                      }
                    }}
                  >
                    {item.thumbnail ? (
                      <CroppedImage $size="small">
                        <img src={item.thumbnail} />
                      </CroppedImage>
                    ) : null}
                    <SingleLineHeading5>
                      <LocaleString>{item.label || { none: [t('Untitled')] }}</LocaleString>
                    </SingleLineHeading5>
                  </ImageGridItem>
                );
              })}
            </ImageGrid>
          </>
        ) : null}
      </ExplorerBackground>
    );
  }

  return (
    <ExplorerBackground>
      <form
        onSubmit={e => {
          e.preventDefault();
          performSearch(contentType);
        }}
      >
        <InputContainer wide>
          <InputLabel>{contentType === 'collection' ? t('Find collection') : t('Find manifest')}</InputLabel>
          <GridContainer>
            <ExpandGrid>
              <Input
                placeholder={t('Search for existing content')}
                type="text"
                onChange={e => setSearch(e.currentTarget.value)}
              />
            </ExpandGrid>
            <Button type="submit">{t('Search')}</Button>
          </GridContainer>
        </InputContainer>
        {searchResults ? (
          <div style={{ border: '2px solid #333', padding: 20 }}>
            <>
              <Heading3>{t('Search results')}</Heading3>
              <TableContainer>
                {searchResults.map((item, key) => {
                  return (
                    <TableRow key={key}>
                      <TableRowLabel>{item.label}</TableRowLabel>
                      <TableActions>
                        <TinyButton
                          onClick={() => {
                            if (contentType === 'collection') {
                              setCollectionId(item.id);
                              addNewRecent({
                                id: item.id,
                                type: 'collection',
                                label: { none: [item.label] },
                              });
                            } else {
                              setManifestId(item.id);
                              addNewRecent({
                                id: item.id,
                                type: 'manifest',
                                label: { none: [item.label] },
                              });
                            }
                          }}
                        >
                          {t('choose')}
                        </TinyButton>
                      </TableActions>
                    </TableRow>
                  );
                })}
                {searchResults.length === 0 ? t('No results') : null}
              </TableContainer>
            </>
          </div>
        ) : null}
      </form>
    </ExplorerBackground>
  );
};

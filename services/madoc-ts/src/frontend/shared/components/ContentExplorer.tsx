// 1. Choice between manifest / collection
// 2. Autocomplete box
// 3. Choose collection or manifest
// 4. Choose canvas
// 5. Return resource in callback (manifest + canvas)

import React, { useCallback, useEffect, useState } from 'react';
import { Button, TinyButton } from '../atoms/Button';
import { useAutocomplete } from '../hooks/use-autocomplete';
import { Input, InputContainer, InputLabel } from '../atoms/Input';
import { ExpandGrid, GridContainer } from '../atoms/Grid';
import { useTranslation } from 'react-i18next';
import { Heading3 } from '../atoms/Heading3';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../atoms/Table';
import { useQuery } from 'react-query';
import { useApi } from '../hooks/use-api';
import { LocaleString } from './LocaleString';
import { ImageGrid, ImageGridItem } from '../atoms/ImageGrid';
import { CroppedImage } from '../atoms/Images';
import { SingleLineHeading5 } from '../atoms/Heading5';
import styled from 'styled-components';
import { useRecent } from '../hooks/use-recent';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';

const ExplorerBackground = styled.div`
  background: #eee;
  padding: 1em;
`;

export const CollectionExplorer: React.FC<{
  id: number;
  type: string;
  onChoose: (id: number, item: ItemStructureListItem) => void;
}> = ({ id, type, onChoose }) => {
  const { t } = useTranslation();
  const api = useApi();
  const { data, status } = useQuery(['preview-structure', id], () => {
    if (type === 'collection') {
      return api.getCollectionStructure(id);
    }
    return api.getManifestStructure(id);
  });
  const [page, setPage] = useState(0);
  const pages = data ? Math.ceil(data.items.length / 24) : 0;
  const items = data ? data.items.slice(page * 24, page * 24 + 24) : [];

  useEffect(() => {
    setPage(0);
  }, [id]);

  if (!data || status !== 'success') {
    return <div>Loading</div>;
  }

  return (
    <>
      <ImageGrid>
        {items
          ? items.map(canvas => {
              return (
                <ImageGridItem $size="small" key={canvas.id} onClick={() => onChoose(canvas.id, canvas)}>
                  {canvas.thumbnail ? (
                    <CroppedImage $size="small">
                      <img src={canvas.thumbnail} />
                    </CroppedImage>
                  ) : null}
                  <SingleLineHeading5>
                    <LocaleString>{canvas.label || { none: ['Untitled'] }}</LocaleString>
                  </SingleLineHeading5>
                </ImageGridItem>
              );
            })
          : null}
      </ImageGrid>
      <div style={{ margin: '1em 0' }}>
        {page !== 0 ? <TinyButton onClick={() => setPage(page - 1)}>{t('Previous page')}</TinyButton> : null}
        <div style={{ display: 'inline-block', margin: 10, fontSize: '0.9em' }}>
          Page {page + 1} of {pages}
        </div>
        {page + 1 !== pages ? <TinyButton onClick={() => setPage(page + 1)}>{t('Next page')}</TinyButton> : null}
      </div>
    </>
  );
};

// @todo 5 most recent choices in local storage.
export const ContentExplorer: React.FC<{ renderChoice: (id: number, reset: () => void) => any }> = ({
  renderChoice,
}) => {
  const [recent, addNewRecent] = useRecent<ItemStructureListItem>('content-explorer');
  const { t } = useTranslation();
  const [contentType, setContentType] = useState<'collection' | 'manifest' | undefined>();
  const [search, setSearch] = useState<string>('');
  const [performSearch, type, searchResults] = useAutocomplete(search);

  const [collectionId, setCollectionId] = useState<number | undefined>();
  const [manifestId, setManifestId] = useState<number | undefined>();
  const [canvasId, setCanvasId] = useState<number | undefined>();

  const resetCanvas = useCallback(() => setCanvasId(undefined), []);

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
        <Button onClick={() => setContentType('collection')}>Collection</Button> |{' '}
        <Button onClick={() => setContentType('manifest')}>Manifest</Button>
        {recent.length ? (
          <>
            <h4>Recent items</h4>

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
                      <LocaleString>{item.label || { none: ['Untitled'] }}</LocaleString>
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

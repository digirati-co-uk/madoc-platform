import { useApi } from '../../shared/hooks/use-api';
import { Link, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { useReorderItems } from '../hooks/use-reorder-items';
import { ExpandGrid, GridContainer, HalfGird } from '../../shared/atoms/Grid';
import { Input, InputContainer, InputLabel } from '../../shared/atoms/Input';
import { Button, SmallButton, TinyButton } from '../../shared/atoms/Button';
import { Heading3 } from '../../shared/atoms/Heading3';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { ReorderTable, ReorderTableRow } from '../../shared/atoms/ReorderTable';
import { LocaleString } from '../../shared/components/LocaleString';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { useTranslation } from 'react-i18next';
import { useData } from '../../shared/hooks/use-data';

export const CollectionEditorStructure: React.FC<{
  searchManifests?: boolean;
  searchCollections?: boolean;
  hideManifests?: boolean;
  enableNavigation?: boolean;
  items?: ItemStructureListItem[];
  saveOrder: (newOrder: number[]) => Promise<void> | void;
}> = ({ items, saveOrder, searchCollections, hideManifests, searchManifests, enableNavigation }) => {
  const { t } = useTranslation();
  const api = useApi();
  const [search, setSearch] = useState('');
  const [searchResultsType, setSearchResultsType] = useState('');
  const [searchResults, setSearchResults] = useState<undefined | Array<{ id: number; label: string }>>();
  const {
    unsaved,
    saving,
    updateOrder,
    itemIds,
    itemMap,
    toBeRemoved,
    reorderItems,
    addItem,
    addNewItem,
    removeItem,
  } = useReorderItems({
    items,
    saveOrder: newOrder => {
      setSearchResults(undefined);
      return saveOrder(newOrder);
    },
  });

  const performSearch = (type: string) => {
    if (type === 'manifest') {
      api.autocompleteManifests(search).then(results => {
        setSearchResultsType(type);
        setSearchResults(results);
      });
    } else {
      api.autocompleteCollections(search).then(results => {
        setSearchResultsType(type);
        setSearchResults(results);
      });
    }
  };

  if (!items) {
    return <>{t('loading')}</>;
  }

  return (
    <>
      {searchCollections || searchManifests ? (
        <GridContainer>
          {searchManifests ? (
            <HalfGird>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  performSearch('manifest');
                }}
              >
                <InputContainer wide>
                  <InputLabel>{t('Add existing manifest')}</InputLabel>
                  <GridContainer>
                    <ExpandGrid>
                      <Input
                        placeholder={t('Search for existing manifest')}
                        type="text"
                        onChange={e => setSearch(e.currentTarget.value)}
                      />
                    </ExpandGrid>
                    <Button type="submit">{t('Search')}</Button>
                  </GridContainer>
                </InputContainer>
              </form>
            </HalfGird>
          ) : null}
          {searchCollections ? (
            <HalfGird>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  performSearch('collection');
                }}
              >
                <InputContainer wide>
                  <InputLabel>{t('Add existing collection')}</InputLabel>
                  <GridContainer>
                    <ExpandGrid>
                      <Input
                        placeholder={t('Search for existing collection')}
                        type="text"
                        onChange={e => setSearch(e.currentTarget.value)}
                      />
                    </ExpandGrid>
                    <Button type="submit">{t('Search')}</Button>
                  </GridContainer>
                </InputContainer>
              </form>
            </HalfGird>
          ) : null}
        </GridContainer>
      ) : null}

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
                      {itemIds.indexOf(item.id) === -1 ? (
                        <TinyButton
                          onClick={() =>
                            addNewItem({ id: item.id, type: searchResultsType, label: { none: [item.label] } })
                          }
                        >
                          {t('add')}
                        </TinyButton>
                      ) : (
                        <TinyButton onClick={() => removeItem(item.id)}>{t('remove')}</TinyButton>
                      )}
                    </TableActions>
                  </TableRow>
                );
              })}
              {searchResults.length === 0 ? t('No results') : null}
            </TableContainer>
          </>
        </div>
      ) : null}

      <div>
        {unsaved && (
          <SmallButton disabled={saving} onClick={() => updateOrder(itemIds)}>
            {t('Save changes')}
          </SmallButton>
        )}
        <ReorderTable reorder={reorderItems}>
          {itemIds.map((id, key) => {
            const item = itemMap[`${id}`];
            if (!item || (hideManifests && item.type === 'manifest')) {
              return null;
            }
            return (
              <ReorderTableRow
                id={`item-${item.id}`}
                key={`item-${item.id}`}
                idx={key}
                label={
                  <>
                    {enableNavigation ? (
                      <LocaleString as={Link} to={`/${item.type}s/${item.id}`}>
                        {item.label}
                      </LocaleString>
                    ) : (
                      <LocaleString>{item.label}</LocaleString>
                    )}{' '}
                    {item.type ? (
                      <>
                        - <strong>{item.type}</strong>
                      </>
                    ) : null}
                  </>
                }
              >
                <TinyButton onClick={() => removeItem(item.id)}>{t('remove')}</TinyButton>
              </ReorderTableRow>
            );
          })}
        </ReorderTable>
      </div>
      {toBeRemoved.length ? (
        <>
          <Heading3>{t('To be removed')}</Heading3>
          <TableContainer>
            {toBeRemoved.map(id => {
              const item = itemMap[`${id}`];
              if (!item) {
                return null;
              }
              return (
                <TableRow key={id} warning>
                  <TableRowLabel>
                    <LocaleString>{item.label}</LocaleString> - {item.id}
                  </TableRowLabel>
                  <TableActions>
                    <TinyButton onClick={() => addItem(item.id)}>{t('undo')}</TinyButton>
                  </TableActions>
                </TableRow>
              );
            })}
          </TableContainer>
        </>
      ) : null}
      {unsaved && (
        <SmallButton disabled={saving} onClick={() => updateOrder(itemIds)}>
          {t('Save changes')}
        </SmallButton>
      )}
    </>
  );
};

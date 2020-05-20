import React, { useState } from 'react';
import { UniversalComponent } from '../../../../types';
import { ItemStructureList } from '../../../../../types/schemas/item-structure-list';
import { createUniversalComponent, useData } from '../../../utility';
import { LocaleString } from '../../../molecules/LocaleString';
import { useApi } from '../../../hooks/use-api';
import { Link, useParams } from 'react-router-dom';
import { Button, SmallButton, TinyButton } from '../../../atoms/Button';
import { ContextHeading, Header } from '../../../atoms/Header';
import { Subheading1 } from '../../../atoms/Heading1';
import { ReorderTable, ReorderTableRow } from '../../../atoms/ReorderTable';
import { resetServerContext } from 'react-beautiful-dnd';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../atoms/Table';
import { Heading3 } from '../../../atoms/Heading3';
import { useReorderItems } from '../../../hooks/use-reorder-items';
import { Input, InputContainer, InputLabel, InputLink } from '../../../atoms/Input';
import { ExpandGrid, GridContainer, HalfGird } from '../../../atoms/Grid';

type EditCollectionStructureType = {
  data: ItemStructureList;
  params: { id: string };
  query: {};
  variables: { id: number };
};

export const EditCollectionStructure: UniversalComponent<EditCollectionStructureType> = createUniversalComponent<
  EditCollectionStructureType
>(
  () => {
    const api = useApi();
    const params = useParams<{ id: string }>();
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<undefined | Array<{ id: number; label: string }>>();
    const { data, refetch } = useData(EditCollectionStructure);
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
      items: data ? data.items : undefined,
      saveOrder: async newOrder => {
        setSearchResults(undefined);
        await api.updateCollectionStructure(Number(params.id), newOrder);
        await refetch();
      },
    });

    const performSearch = (type: string) => {
      if (type === 'manifest') {
        api.autocompleteManifests(search).then(results => {
          setSearchResults(results);
        });
      } else {
        api.autocompleteCollections(search).then(results => {
          setSearchResults(results);
        });
      }
    };

    if (!data) {
      return <>loading...</>;
    }

    return (
      <>
        <GridContainer>
          <HalfGird>
            <form
              onSubmit={e => {
                e.preventDefault();
                performSearch('manifest');
              }}
            >
              <InputContainer wide>
                <InputLabel>Add existing manifest</InputLabel>
                <GridContainer>
                  <ExpandGrid>
                    <Input
                      placeholder="Search for existing manifest"
                      type="text"
                      onChange={e => setSearch(e.currentTarget.value)}
                    />
                  </ExpandGrid>
                  <Button type="submit">Search</Button>
                </GridContainer>
              </InputContainer>
            </form>
          </HalfGird>
          <HalfGird>
            <form
              onSubmit={e => {
                e.preventDefault();
                performSearch('collection');
              }}
            >
              <InputContainer wide>
                <InputLabel>Add existing collection</InputLabel>
                <GridContainer>
                  <ExpandGrid>
                    <Input
                      placeholder="Search for existing collection"
                      type="text"
                      onChange={e => setSearch(e.currentTarget.value)}
                    />
                  </ExpandGrid>
                  <Button type="submit">Search</Button>
                </GridContainer>
              </InputContainer>
            </form>
          </HalfGird>
        </GridContainer>

        {searchResults ? (
          <div style={{ border: '2px solid #333', padding: 20 }}>
            <>
              <Heading3>Search results</Heading3>
              <TableContainer>
                {searchResults.map((item, key) => {
                  return (
                    <TableRow key={key}>
                      <TableRowLabel>{item.label}</TableRowLabel>
                      <TableActions>
                        {itemIds.indexOf(item.id) === -1 ? (
                          <TinyButton onClick={() => addNewItem({ id: item.id, label: { none: [item.label] } })}>
                            add
                          </TinyButton>
                        ) : (
                          <TinyButton onClick={() => removeItem(item.id)}>remove</TinyButton>
                        )}
                      </TableActions>
                    </TableRow>
                  );
                })}
                {searchResults.length === 0 ? 'No results' : null}
              </TableContainer>
            </>
          </div>
        ) : null}

        <div>
          {unsaved && (
            <SmallButton disabled={saving} onClick={() => updateOrder(itemIds)}>
              Save changes
            </SmallButton>
          )}
          <ReorderTable reorder={reorderItems}>
            {itemIds.map((id, key) => {
              const item = itemMap[`${id}`];
              if (!item) {
                return null;
              }
              return (
                <ReorderTableRow
                  id={`item-${item.id}`}
                  key={`item-${item.id}`}
                  idx={key}
                  label={
                    <>
                      <LocaleString>{item.label}</LocaleString> - {item.id}
                    </>
                  }
                >
                  <TinyButton onClick={() => removeItem(item.id)}>remove</TinyButton>
                </ReorderTableRow>
              );
            })}
          </ReorderTable>
        </div>
        {toBeRemoved.length ? (
          <>
            <Heading3>To be removed</Heading3>
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
                      <TinyButton onClick={() => addItem(item.id)}>undo</TinyButton>
                    </TableActions>
                  </TableRow>
                );
              })}
            </TableContainer>
          </>
        ) : null}
        {unsaved && (
          <SmallButton disabled={saving} onClick={() => updateOrder(itemIds)}>
            Save changes
          </SmallButton>
        )}
      </>
    );
  },
  {
    getKey: params => {
      return ['collection-structure', { id: Number(params.id) }];
    },
    getData: async (key, vars, api) => {
      resetServerContext();

      return await api.getCollectionStructure(vars.id);
    },
  }
);

import React, { useState } from 'react';
import { UniversalComponent } from '../../../../types';
import { ItemStructureList } from '../../../../../types/schemas/item-structure-list';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useApi } from '../../../../shared/hooks/use-api';
import { Link, useParams } from 'react-router-dom';
import { SmallButton, TinyButton } from '../../../../shared/atoms/Button';
import { ContextHeading, Header } from '../../../../shared/atoms/Header';
import { Subheading1 } from '../../../../shared/atoms/Heading1';
import { ReorderTable, ReorderTableRow } from '../../../../shared/atoms/ReorderTable';
import { resetServerContext } from 'react-beautiful-dnd';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../../shared/atoms/Table';
import { Heading3 } from '../../../../shared/atoms/Heading3';
import { useReorderItems } from '../../../hooks/use-reorder-items';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type EditManifestStructureType = {
  data: ItemStructureList;
  params: { id: string };
  query: {};
  variables: { id: number };
};

export const EditManifestStructure: UniversalComponent<EditManifestStructureType> = createUniversalComponent<
  EditManifestStructureType
>(
  () => {
    const api = useApi();
    const { t } = useTranslation();
    const params = useParams<{ id: string }>();
    const [showThumbs, setShowThumbs] = useState(false);
    const { data, refetch } = useData(EditManifestStructure);
    const {
      unsaved,
      saving,
      updateOrder,
      itemIds,
      itemMap,
      toBeRemoved,
      toBeAdded,
      reorderItems,
      addItem,
      removeItem,
      addNewItem,
    } = useReorderItems({
      items: data ? data.items : undefined,
      saveOrder: async newOrder => {
        await api.updateManifestStructure(Number(params.id), newOrder);
        await refetch();
      },
    });

    if (!data) {
      return <>loading...</>;
    }

    return (
      <>
        <div>
          <SmallButton onClick={() => setShowThumbs(r => !r)}>
            {showThumbs ? t('Hide thumbs') : t('Show thumbs')}
          </SmallButton>
          <hr />
          {unsaved && (
            <SmallButton disabled={saving} onClick={() => updateOrder(itemIds)}>
              Save changes
            </SmallButton>
          )}
          <ReorderTable reorder={reorderItems}>
            {itemIds.map((id, key) => {
              const item = itemMap[`${id}`];
              return (
                <ReorderTableRow
                  id={`item-${item.id}`}
                  key={`item-${item.id}`}
                  idx={key}
                  addition={toBeAdded.indexOf(item.id) !== -1}
                  label={
                    <>
                      {showThumbs && item.thumbnail ? (
                        <TableRowLabel>
                          <InView>
                            {({ ref, inView }) => (
                              <div ref={ref} style={{ height: 90, width: 90 }}>
                                {inView ? <img src={item.thumbnail} height={90} /> : null}
                              </div>
                            )}
                          </InView>
                        </TableRowLabel>
                      ) : null}
                      <LocaleString>{item.label}</LocaleString>
                    </>
                  }
                >
                  <SmallButton onClick={() => removeItem(item.id)}>remove</SmallButton>
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
                      <SmallButton onClick={() => addItem(item.id)}>undo</SmallButton>
                    </TableActions>
                  </TableRow>
                );
              })}
            </TableContainer>
          </>
        ) : null}
        {data.originals && data.originals.length ? (
          <>
            <Heading3>Original canvases from this manifest</Heading3>
            <TableContainer>
              {data.originals.map(item =>
                itemIds.indexOf(item.id) === -1 ? (
                  <TableRow key={item.id}>
                    <TableRowLabel>
                      {showThumbs && item.thumbnail ? (
                        <TableRowLabel>
                          <InView>
                            {({ ref, inView }) => (
                              <div ref={ref} style={{ height: 90, width: 90 }}>
                                {inView ? <img src={item.thumbnail} height={90} /> : null}
                              </div>
                            )}
                          </InView>
                        </TableRowLabel>
                      ) : null}
                      <LocaleString>{item.label}</LocaleString> - {item.id}
                    </TableRowLabel>
                    <TableActions>
                      <TinyButton onClick={() => addNewItem(item)}>add</TinyButton>
                    </TableActions>
                  </TableRow>
                ) : null
              )}
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
      return ['manifest-structure', { id: Number(params.id) }];
    },
    getData: async (key, vars, api) => {
      resetServerContext();

      return await api.getManifestStructure(vars.id);
    },
  }
);

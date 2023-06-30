import React, { FormEvent, useState } from 'react';
import { useMutation } from 'react-query';
import { UpdateManifestDetailsRequest } from '../../../../../routes/iiif/manifests/update-manifest-details';
import { SnippetThumbnail, SnippetThumbnailContainer } from '../../../../shared/atoms/SnippetLarge';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { UniversalComponent } from '../../../../types';
import { ItemStructureList } from '../../../../../types/schemas/item-structure-list';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useApi } from '../../../../shared/hooks/use-api';
import { useParams } from 'react-router-dom';
import { Button, SmallButton, TinyButton } from '../../../../shared/navigation/Button';
import { ReorderTable, ReorderTableRow } from '../../../../shared/atoms/ReorderTable';
import { resetServerContext } from 'react-beautiful-dnd';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { Heading3 } from '../../../../shared/typography/Heading3';
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

    const { data: manifest, refetch: refetchManifest, updatedAt } = apiHooks.getManifestById(() => [Number(params.id)]);

    const [updateDetails, updateDetailsStatus] = useMutation(async (details: UpdateManifestDetailsRequest) => {
      await api.updateManifestDetails(Number(params.id), details);
      await refetchManifest();
    });

    const updateDetailsForm = (e: FormEvent) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const newData = Object.fromEntries(formData.entries());
      if (Object.keys(newData).length === 0) return;
      updateDetails(newData as UpdateManifestDetailsRequest);
    };

    const itemProps = { disabled: updateDetailsStatus.isLoading };

    if (!data) {
      return <>loading...</>;
    }

    return (
      <>
        <div>
          {manifest ? (
            <form
              key={updatedAt}
              onSubmit={updateDetailsForm}
              style={{ background: '#eee', borderRadius: 3, padding: '1em', marginBottom: '1em' }}
            >
              <h3>Update manifest details</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em', width: '100%' }}>
                <InputContainer wide style={{ flex: 1 }}>
                  <InputLabel>Thumbnail</InputLabel>
                  <Input
                    type="text"
                    name="default_thumbnail"
                    defaultValue={manifest?.manifest.thumbnail || ''}
                    {...itemProps}
                  />
                </InputContainer>
                <SnippetThumbnailContainer style={{ marginLeft: '1em' }}>
                  <SnippetThumbnail src={manifest?.manifest.thumbnail} />
                </SnippetThumbnailContainer>
              </div>
              <Button type={'submit'}>Save</Button>
            </form>
          ) : null}

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
                          <div>
                            <InView>
                              {({ ref, inView }) => (
                                <div ref={ref} style={{ height: 90, width: 90 }}>
                                  {inView ? <img src={item.thumbnail} height={90} /> : null}
                                </div>
                              )}
                            </InView>
                            <SmallButton
                              disabled={updateDetailsStatus.isLoading}
                              onClick={() => updateDetails({ default_thumbnail: item.thumbnail })}
                            >
                              Use as manifest thumbnail
                            </SmallButton>
                          </div>
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

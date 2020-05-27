import React from 'react';
import { UniversalComponent } from '../../../../types';
import { ItemStructureList } from '../../../../../types/schemas/item-structure-list';
import { useApi } from '../../../../shared/hooks/use-api';
import { useParams } from 'react-router-dom';
import { resetServerContext } from 'react-beautiful-dnd';
import { CollectionEditorStructure } from '../../../molecules/CollectionStructureEditor';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

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
    const { data, refetch } = useData(EditCollectionStructure);
    const params = useParams<{ id: string }>();
    const api = useApi();

    return (
      <CollectionEditorStructure
        searchCollections={true}
        searchManifests={true}
        items={data ? data.items : undefined}
        saveOrder={async newOrder => {
          await api.updateCollectionStructure(Number(params.id), newOrder);
          await refetch();
        }}
      />
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

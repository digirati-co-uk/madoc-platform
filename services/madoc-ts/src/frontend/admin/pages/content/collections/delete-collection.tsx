import React from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/atoms/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { useHistory, useParams } from 'react-router-dom';
import { Heading3 } from '../../../../shared/atoms/Heading3';
import { CollectionDeletionSummary } from '../../../../../types/deletion-summary';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useData } from '../../../../shared/hooks/use-data';

type DeleteCollectionType = {
  data: CollectionDeletionSummary;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const DeleteCollection: UniversalComponent<DeleteCollectionType> = createUniversalComponent<DeleteCollectionType>(
  () => {
    const { data } = useData(DeleteCollection);
    const { id } = useParams<{ id: string }>();
    const history = useHistory();

    const api = useApi();

    const [deleteCollection, { status }] = useMutation(async () => {
      await api.deleteCollection(Number(id));
      history.push(`/collections`);
    });

    return (
      <p>
        <Heading3>Are you sure you want to delete this collection?</Heading3>
        {data ? (
          <>
            {data.fullDelete ? (
              <p>This collection will be fully deleted, reimporting will refresh linking properties and metadata.</p>
            ) : (
              <p>
                This collection will still be available on <strong>{data.siteCount - 1}</strong> other site(s) and
                reimporting will not refresh linking properties or metadata. You must delete from all sites to fully
                delete the collection.
              </p>
            )}
            {data.search?.indexed ? <p>This item is currently in the search index, it will be removed</p> : null}
            {data.tasks ? (
              <p>
                There are <strong>{data.tasks}</strong> tasks directly with this manifest that will be deleted
              </p>
            ) : null}
            {data.parentTasks ? (
              <p>
                There are <strong>{data.parentTasks}</strong> tasks indirectly associated with this manifest that will
                be deleted
              </p>
            ) : null}
          </>
        ) : null}
        <Button disabled={status !== 'idle'} onClick={() => deleteCollection()}>
          Delete collection
        </Button>
      </p>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getCollectionDeletionSummary(vars.id);
    },
    getKey(params, query) {
      return ['collection-deletion', {id: Number(params.id), page: query.page || 1}];
    },
  }
);

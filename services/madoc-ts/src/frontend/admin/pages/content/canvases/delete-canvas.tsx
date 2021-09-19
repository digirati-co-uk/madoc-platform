import React from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/navigation/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { useHistory, useParams } from 'react-router-dom';
import { Heading3 } from '../../../../shared/typography/Heading3';
import { CanvasDeletionSummary } from '../../../../../types/deletion-summary';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useData } from '../../../../shared/hooks/use-data';

type DeleteCanvasType = {
  data: CanvasDeletionSummary;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const DeleteCanvas: UniversalComponent<DeleteCanvasType> = createUniversalComponent<DeleteCanvasType>(
  () => {
    const { data } = useData(DeleteCanvas);
    const { id } = useParams<{ id: string }>();
    const history = useHistory();

    const api = useApi();

    const [deleteCanvas, { status }] = useMutation(async () => {
      await api.deleteCanvas(Number(id));
      history.push(`/`);
    });

    return (
      <p>
        <Heading3>Are you sure you want to delete this canvas?</Heading3>
        {data ? (
          <>
            {data.search?.indexed ? <p>This item is currently in the search index, it will be removed</p> : null}
            {data.tasks ? (
              <p>
                There are <strong>{data.tasks}</strong> tasks directly with this canvas that will be deleted
              </p>
            ) : null}
            {data.parentTasks ? (
              <p>
                There are <strong>{data.parentTasks}</strong> tasks indirectly associated with this canvas that will be
                deleted
              </p>
            ) : null}
          </>
        ) : null}
        <Button disabled={status !== 'idle'} onClick={() => deleteCanvas()}>
          Delete canvas
        </Button>
      </p>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getCanvasDeletionSummary(vars.id);
    },
    getKey(params, query) {
      return ['canvas-deletion', { id: Number(params.id), page: query.page || 1 }];
    },
  }
);

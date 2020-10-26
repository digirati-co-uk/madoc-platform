import React from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/atoms/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useParams } from 'react-router-dom';

type CanvasSearchIndexType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: any;
};

export const CanvasSearchIndex = createUniversalComponent<CanvasSearchIndexType>(
  () => {
    const { data, isError, refetch } = useData(CanvasSearchIndex, {}, { retry: 0 });
    const { id } = useParams();

    const api = useApi();
    const [indexContext, { isLoading }] = useMutation(async () => {
      await api.indexCanvas(Number(id));
      await refetch();
    });

    if (isError) {
      return (
        <div>
          Item is not in the search index
          <Button disabled={isLoading} onClick={() => indexContext()}>
            Index manifest
          </Button>
        </div>
      );
    }

    if (!data) {
      return <div>loading...</div>;
    }

    return (
      <div>
        <h2>This canvas in the search index.</h2>
        <hr />
        <Button disabled={isLoading} onClick={() => indexContext()}>
          Reindex canvas
        </Button>
        <hr />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  },
  {
    getKey: params => {
      return ['canvas-search-index', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      return api.searchGetIIIF(`urn:madoc:canvas:${id}`);
    },
  }
);

import React from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/navigation/Button';
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
    const { data, isError, isFetching, refetch } = useData(CanvasSearchIndex, {}, { retry: 0 });
    const { id } = useParams<{ id: string }>();

    const api = useApi();
    const [indexContext, { isLoading }] = useMutation(async () => {
      await api.indexCanvas(Number(id));
      await refetch();
    });

    const [invokeEnrichment, { isLoading: enrichLoading }] = useMutation(async () => {
      await api.search.triggerSearchIndex(Number(id), 'canvas');
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

    if (!data || isFetching) {
      return <div>loading...</div>;
    }

    return (
      <div>
        <h2>This canvas in the search index.</h2>
        <hr />
        <Button disabled={isLoading} onClick={() => indexContext()}>
          Reindex canvas
        </Button>
        {'  '}
        <Button disabled={isLoading} onClick={() => invokeEnrichment()}>
          {enrichLoading ? `...loading` : 'Invoke enrichment'}
        </Button>
        <hr />
        <pre>{JSON.stringify(data.canvas, null, 2)}</pre>
        <h4>Indexable</h4>
        {data && data.models
          ? data.models.results.map((result: any, key: number) => {
              return (
                <div key={key}>
                  <h4>
                    {result.type} ({result.subtype})
                  </h4>
                  {result.indexable}
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              );
            })
          : null}
      </div>
    );
  },
  {
    getKey: params => {
      return ['canvas-search-index', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      try {
        return {
          canvas: await api.search.searchGetIIIF(`urn:madoc:canvas:${id}`),
          models: { results: [] },
          // models: await api.searchListModels({ iiif__madoc_id: `urn:madoc:canvas:${id}` }),
        };
      } catch (e) {
        return {
          canvas: null,
          models: { results: [] },
        };
      }
    },
  }
);

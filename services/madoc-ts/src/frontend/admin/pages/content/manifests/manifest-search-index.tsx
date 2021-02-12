import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/atoms/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useParams } from 'react-router-dom';
import { EditManifestStructure } from './edit-manifest-structure';

type ManifestSearchIndexType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: any;
};

export const ManifestSearchIndex = createUniversalComponent<ManifestSearchIndexType>(
  () => {
    const { data, isError, refetch } = useData(ManifestSearchIndex, {}, { retry: 0 });
    const { data: structure } = useData(EditManifestStructure);
    const { id } = useParams<{ id: string }>();
    const [percent, setPercent] = useState(0);
    const totalCanvases = structure?.items.length || 0;

    const api = useApi();
    const [indexContext, { isLoading }] = useMutation(async () => {
      await api.wrapTask(
        api.batchIndexResources([{ id: Number(id), type: 'manifest' }], { recursive: true }),
        async () => {
          await refetch();
        },
        {
          progress: remaining => {
            if (totalCanvases) {
              setPercent(Math.floor(((totalCanvases - remaining) / totalCanvases) * 100));
            }
          },
        }
      );
    });

    if (isError) {
      return (
        <div>
          Item is not in the search index
          <Button disabled={isLoading} onClick={() => indexContext()}>
            Index manifest {isLoading && percent ? ` ${percent}%` : null}
          </Button>
        </div>
      );
    }

    if (!data) {
      return <div>loading...</div>;
    }

    return (
      <div>
        <h2>This manifest in the search index.</h2>
        <hr />
        <Button disabled={isLoading} onClick={() => indexContext()}>
          Reindex manifest {isLoading && percent ? ` ${percent}%` : null}
        </Button>
        <hr />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  },
  {
    getKey: params => {
      return ['manifest-search-index', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      return api.searchGetIIIF(`urn:madoc:manifest:${id}`);
    },
  }
);

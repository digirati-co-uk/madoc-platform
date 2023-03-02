import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/navigation/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useParams } from 'react-router-dom';
import { useIndexResource } from '../../../hooks/use-index-resource';
import { EditManifestStructure } from './edit-manifest-structure';
import { ManageTags } from '../../../molecules/ManageTags';

type ManifestSearchIndexType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: any;
};

export const ManifestSearchIndex = createUniversalComponent<ManifestSearchIndexType>(
  () => {
    const { data, isError, refetch } = useData(
      ManifestSearchIndex,
      {},
      { retry: 0, useErrorBoundary: false, suspense: false }
    );
    const { data: structure } = useData(EditManifestStructure);
    const { id } = useParams<{ id: string }>();
    const totalCanvases = structure?.items.length || 0;
    const [indexContext, { isLoading, percent }] = useIndexResource(Number(id), 'manifest', totalCanvases, async () => {
      await refetch();
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
        <ManageTags data={data} type="manifest" id={Number(id)} refresh={refetch} />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  },
  {
    getKey: params => {
      return ['manifest-search-index', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      try {
        return api.searchGetIIIF(`urn:madoc:manifest:${id}`);
      } catch (e) {
        console.log('err', e);
        return null;
      }
    },
  }
);
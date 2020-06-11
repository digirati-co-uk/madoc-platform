import React from 'react';
import { ManifestListResponse } from '../../../types/schemas/manifest-list';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link, useParams } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';

type AllManifestsType = {
  params: { projectId?: string };
  query: { page: string };
  variables: { projectId?: number; page: number };
  data: ManifestListResponse;
};

export const AllManifests: UniversalComponent<AllManifestsType> = createUniversalComponent<AllManifestsType>(
  () => {
    const params = useParams<AllManifestsType['params']>();
    const { latestData, resolvedData: data } = usePaginatedData(AllManifests);

    if (!data) {
      return <>Loading...</>;
    }

    return (
      <>
        <h1>All manifests</h1>
        {data.manifests.map(manifest => (
          <div key={manifest.id}>
            <Link
              to={
                params.projectId
                  ? `/projects/${params.projectId}/manifests/${manifest.id}`
                  : `/manifests/${manifest.id}`
              }
            >
              <LocaleString>{manifest.label}</LocaleString>
            </Link>
          </div>
        ))}
        <Pagination
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />
      </>
    );
  },
  {
    getKey: (params, query) => {
      return ['site-manifests', { project_id: params.projectId, page: Number(query.page) || 1 }];
    },
    getData: (key, vars, api) => {
      return api.getSiteManifests({ project_id: vars.projectId, page: vars.page });
    },
  }
);

import React from 'react';
import { Outlet } from 'react-router-dom';
import { ManifestListResponse } from '../../../../types/schemas/manifest-list';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';

type ManifestListLoaderType = {
  params: { slug?: string };
  query: { page: string };
  variables: { projectId?: string; page: number };
  data: ManifestListResponse;
};

export const ManifestListLoader: UniversalComponent<ManifestListLoaderType> = createUniversalComponent<
  ManifestListLoaderType
>(
  () => {
    return <Outlet />;
  },
  {
    getKey: (params, query) => {
      return ['site-manifests', { projectId: params.slug, page: Number(query.page) || 1 }];
    },
    getData: (key, vars, api) => {
      return api.getSiteManifests({ project_id: vars.projectId, page: vars.page });
    },
  }
);

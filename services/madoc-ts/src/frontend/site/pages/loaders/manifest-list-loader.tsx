import { ManifestListResponse } from '../../../../types/schemas/manifest-list';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';

type ManifestListLoaderType = {
  params: { projectId?: string };
  query: { page: string };
  variables: { projectId?: number; page: number };
  data: ManifestListResponse;
};

export const ManifestListLoader: UniversalComponent<ManifestListLoaderType> = createUniversalComponent<
  ManifestListLoaderType
>(
  ({ route }) => {
    return renderUniversalRoutes(route.routes);
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

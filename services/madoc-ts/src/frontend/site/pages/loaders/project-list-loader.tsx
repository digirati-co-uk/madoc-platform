import { ProjectList } from '../../../../types/schemas/project-list';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';

type ProjectListLoaderType = {
  params: {};
  variables: { page: number };
  query: { page: string };
  data: ProjectList;
};

export const ProjectListLoader: UniversalComponent<ProjectListLoaderType> = createUniversalComponent<
  ProjectListLoaderType
>(
  ({ route }) => {
    return renderUniversalRoutes(route.routes);
  },
  {
    getKey: (params, query) => {
      return ['site-projects', { page: Number(query.page) || 1 }];
    },
    getData: (key, variables, api) => {
      return api.getSiteProjects({ page: variables.page }) as any;
    },
  }
);

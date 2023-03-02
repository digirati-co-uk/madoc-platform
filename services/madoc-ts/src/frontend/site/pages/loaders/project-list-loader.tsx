import React from 'react';
import { Outlet } from 'react-router-dom';
import { ProjectList } from '../../../../types/schemas/project-list';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';

type ProjectListLoaderType = {
  params: Record<string, never>;
  variables: { page: number };
  query: { page: string };
  data: ProjectList;
};

export const ProjectListLoader: UniversalComponent<ProjectListLoaderType> = createUniversalComponent<
  ProjectListLoaderType
>(
  () => {
    return <Outlet />;
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

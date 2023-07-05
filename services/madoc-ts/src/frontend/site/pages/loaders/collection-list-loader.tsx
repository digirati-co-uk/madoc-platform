import React from 'react';
import { Outlet } from 'react-router-dom';
import { ProjectFull } from '../../../../types/project-full';
import { BreadcrumbContext } from '../../blocks/Breadcrumbs';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { Pagination as PaginationType } from '../../../../types/schemas/_pagination';

type CollectionListLoaderType = {
  params: { slug?: string };
  query: { page: string };
  variables: { project_id?: number | string; page: number };
  data: { collections: any[]; pagination: PaginationType };
  context: { project?: ProjectFull };
};

export const CollectionListLoader: UniversalComponent<CollectionListLoaderType> = createUniversalComponent<
  CollectionListLoaderType
>(
  () => {
    return (
      <BreadcrumbContext>
        <Outlet />
      </BreadcrumbContext>
    );
  },
  {
    getKey: (params, query) => {
      return ['site-collections', { page: Number(query.page) || 1, project_id: params.slug }];
    },
    getData: (key, variables, api) => {
      return api.getSiteCollections(variables);
    },
  }
);

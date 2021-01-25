import React from 'react';
import { ProjectFull } from '../../../../types/schemas/project-full';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
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
  ({ route }) => {
    return <BreadcrumbContext>{renderUniversalRoutes(route.routes)}</BreadcrumbContext>;
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

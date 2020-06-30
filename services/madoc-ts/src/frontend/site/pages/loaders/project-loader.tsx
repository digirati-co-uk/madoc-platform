import React, { useMemo } from 'react';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';

type ProjectLoaderType = {
  params: { slug: string };
  query: {};
  variables: { slug: string };
  data: any;
  context: { project: any };
};

export const ProjectLoader: UniversalComponent<ProjectLoaderType> = createUniversalComponent<ProjectLoaderType>(
  ({ route }) => {
    const { data } = useStaticData(ProjectLoader);

    const ctx = useMemo(() => (data ? { id: data.id, name: data.label } : undefined), [data]);

    if (!data) {
      return <div>Loading...</div>;
    }

    return (
      <BreadcrumbContext project={ctx}>{renderUniversalRoutes(route.routes, { project: data })}</BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      return ['site-project', { slug: params.slug }];
    },
    getData: (key, variables, api) => {
      return api.getSiteProject(variables.slug);
    },
  }
);

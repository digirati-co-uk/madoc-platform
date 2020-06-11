import React from 'react';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';

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

    if (!data) {
      return <div>Loading...</div>;
    }

    return <>{renderUniversalRoutes(route.routes, { project: data })}</>;
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

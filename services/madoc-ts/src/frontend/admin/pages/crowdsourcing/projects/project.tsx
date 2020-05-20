import { UniversalComponent } from '../../../../types';
import { createUniversalComponent, useData } from '../../../utility';
import React from 'react';
import { LocaleString } from '../../../molecules/LocaleString';
import { renderUniversalRoutes } from '../../../server-utils';
import { Link } from 'react-router-dom';

type ProjectType = {
  params: { id: string };
  query: {};
  data: any;
  variables: { id: number };
};

export const Project: UniversalComponent<ProjectType> = createUniversalComponent<ProjectType>(
  ({ route }) => {
    const { data, status } = useData(Project);

    if (!data || status === 'loading' || status === 'error') {
      return <div>loading...</div>;
    }

    return (
      <div>
        <h1>
          <LocaleString>{data.label}</LocaleString>
        </h1>
        <Link to={`/projects/${data.id}/model`}>Model</Link>
        <div>{renderUniversalRoutes(route.routes)}</div>
      </div>
    );
  },
  {
    getData: async (key, { id }, api) => {
      return api.getProject(id);
    },
    getKey: params => {
      return ['get-project', { id: Number(params.id) }];
    },
  }
);

import React from 'react';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';

export type TaskLoaderType = {
  params: { id: string };
  variables: { id: string };
  query: {};
  data: BaseTask;
  context: { task: BaseTask };
};

export const TaskLoader: UniversalComponent<TaskLoaderType> = createUniversalComponent<TaskLoaderType>(
  ({ route }) => {
    const { data } = useStaticData(TaskLoader);

    if (!data) {
      return <>Loading...</>;
    }

    return renderUniversalRoutes(route.routes, { task: data });
  },
  {
    getKey: params => {
      return ['task', { id: params.id }];
    },
    getData: (key, vars, api) => {
      return api.getTaskById(vars.id, true);
    },
  }
);

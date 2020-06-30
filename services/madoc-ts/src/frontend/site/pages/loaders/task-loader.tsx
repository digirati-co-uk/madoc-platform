import React, { useMemo } from 'react';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';

export type TaskLoaderType = {
  params: { id: string };
  variables: { id: string };
  query: {};
  data: BaseTask & { id: string };
  context: { task: BaseTask & { id: string } };
};

export const TaskLoader: UniversalComponent<TaskLoaderType> = createUniversalComponent<TaskLoaderType>(
  ({ route }) => {
    const { data } = useStaticData(TaskLoader);

    const ctx = useMemo(() => (data ? { id: data.id, name: data.name } : undefined), [data]);

    if (!data) {
      return <>Loading...</>;
    }

    return <BreadcrumbContext task={ctx}>{renderUniversalRoutes(route.routes, { task: data })}</BreadcrumbContext>;
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

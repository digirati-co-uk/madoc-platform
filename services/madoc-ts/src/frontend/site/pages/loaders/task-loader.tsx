import React, { useMemo } from 'react';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';

export type TaskContext<Task extends BaseTask> = {
  task: Task & { id: string };
  refetch: () => Promise<Task & { id: string }>;
};

export type TaskLoaderType = {
  params: { id: string };
  variables: { id: string };
  query: {};
  data: BaseTask & { id: string };
  context: TaskContext<BaseTask>;
};

export const TaskLoader: UniversalComponent<TaskLoaderType> = createUniversalComponent<TaskLoaderType>(
  ({ route }) => {
    const { data, refetch } = useStaticData(TaskLoader);

    const ctx = useMemo(() => (data ? { id: data.id, name: data.name } : undefined), [data]);

    if (!data) {
      return <>Loading...</>;
    }

    return (
      <BreadcrumbContext task={ctx}>{renderUniversalRoutes(route.routes, { task: data, refetch })}</BreadcrumbContext>
    );
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

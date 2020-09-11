import React, { useMemo } from 'react';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';

export type TaskContext<Task extends BaseTask, ParentTask = Task> = {
  task: Task & { id: string };
  parentTask?: ParentTask & { id: string };
  refetch: () => Promise<{ task: Task & { id: string }; parentTask?: ParentTask & { id: string } }>;
};

export type TaskLoaderType = {
  params: { id: string; parentId?: string };
  variables: { id: string; parentId?: string };
  query: {};
  data: { task: BaseTask & { id: string }; parentTask?: BaseTask & { id: string } };
  context: TaskContext<BaseTask>;
};

export const TaskLoader: UniversalComponent<TaskLoaderType> = createUniversalComponent<TaskLoaderType>(
  ({ route }) => {
    const { data, refetch } = useStaticData(TaskLoader);

    const ctx = useMemo(() => (data ? { id: data.task.id, name: data.task.name } : undefined), [data]);

    if (!data) {
      return <>Loading...</>;
    }

    return (
      <BreadcrumbContext task={ctx}>
        {renderUniversalRoutes(route.routes, { task: data.task, parentTask: data.parentTask, refetch })}
      </BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      return ['task', { id: params.id, parentId: params.parentId }];
    },
    getData: async (key, vars, api) => {
      const [task, parentTask] = await Promise.all([
        api.getTask(vars.id, { all: true }),
        vars.parentId ? api.getTask(vars.parentId) : undefined,
      ]);

      return { task, parentTask };
    },
  }
);

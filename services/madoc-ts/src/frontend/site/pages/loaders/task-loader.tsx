import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../blocks/Breadcrumbs';

export type TaskContext<Task extends BaseTask, ParentTask = Task> = {
  task: Task & { id: string };
  parentTask?: ParentTask & { id: string };
  refetch: () => Promise<{ task: Task & { id: string }; parentTask?: ParentTask & { id: string } }>;
};

export type TaskLoaderType = {
  params: { taskId: string; childTaskId?: string };
  variables: { id: string; parentId?: string };
  query: unknown;
  data: { task: BaseTask & { id: string }; parentTask?: BaseTask & { id: string } };
};

export function useLoadedTask() {
  return useStaticData(
    TaskLoader,
    {},
    {
      cacheTime: 1000 * 60 * 60,
      staleTime: 0,
    }
  );
}

export const TaskLoader: UniversalComponent<TaskLoaderType> = createUniversalComponent<TaskLoaderType>(
  () => {
    const { data } = useLoadedTask();

    const ctx = useMemo(() => (data && data.task ? { id: data.task.id, name: data.task.name } : undefined), [data]);

    return (
      <BreadcrumbContext task={ctx}>
        <Outlet />
      </BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      const taskId = params.childTaskId ? params.childTaskId : params.taskId;
      const parentTaskId = params.childTaskId ? params.taskId : undefined;

      return ['task', { id: taskId, parentId: parentTaskId }];
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

import React from 'react';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { Pagination as PaginationType } from '../../../types/schemas/_pagination';
import { Pagination } from '../../shared/components/Pagination';
import { Link } from 'react-router-dom';

type AllTasksType = {
  query: { page: string };
  variables: { page: number };
  params: {};
  data: { tasks: BaseTask[]; pagination: PaginationType };
};

export const AllTasks: UniversalComponent<AllTasksType> = createUniversalComponent<AllTasksType>(
  () => {
    const { resolvedData: data, latestData } = usePaginatedData(AllTasks);

    if (!data) {
      return <>Loading...</>;
    }
    return (
      <>
        <h1>All tasks</h1>

        {(data.tasks || []).map(task => {
          return (
            <div key={task.id}>
              <Link to={`/tasks/${task.id}`}>{task.name}</Link>
            </div>
          );
        })}
        <Pagination
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />
      </>
    );
  },
  {
    getKey: (params, query) => {
      return ['all-tasks', { page: Number(query.page) || 1 }];
    },
    getData: (key, vars, api) => {
      return api.getTasks(vars.page, { all_tasks: true });
    },
  }
);

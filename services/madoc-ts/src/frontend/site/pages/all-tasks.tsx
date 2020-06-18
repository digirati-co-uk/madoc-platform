import React from 'react';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { Pagination as PaginationType } from '../../../types/schemas/_pagination';
import { Pagination } from '../../shared/components/Pagination';
import { Link } from 'react-router-dom';
import { TableContainer, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { Status } from '../../shared/atoms/Status';
import { useTranslation } from 'react-i18next';
import { useLocationQuery } from '../../shared/hooks/use-location-query';

type AllTasksType = {
  query: { page: string };
  variables: { page: number; query: { type?: string }; projectSlug?: string };
  params: { slug?: string };
  data: { tasks: BaseTask[]; pagination: PaginationType };
};

export const AllTasks: UniversalComponent<AllTasksType> = createUniversalComponent<AllTasksType>(
  () => {
    const { page: _, ...query } = useLocationQuery();
    const { resolvedData: data, latestData } = usePaginatedData(AllTasks);
    const { t } = useTranslation();

    if (!data) {
      return <>Loading...</>;
    }

    return (
      <>
        <h1>All tasks</h1>
        <Pagination
          extraQuery={query}
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />
        <hr />
        <TableContainer>
          {(data.tasks || []).map(subtask => (
            <TableRow key={subtask.id}>
              <TableRowLabel>
                <Status status={subtask.status || 0} text={t(subtask.status_text || 'unknown')} />
              </TableRowLabel>
              <TableRowLabel>
                <Link to={`/tasks/${subtask.id}`}>{subtask.name}</Link>
              </TableRowLabel>
            </TableRow>
          ))}
        </TableContainer>

        <Pagination
          extraQuery={query}
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />
      </>
    );
  },
  {
    getKey: (params, { page = '1', ...query }) => {
      return ['all-tasks', { page: Number(page) || 1, query, projectSlug: params.slug }];
    },
    getData: async (key, vars, api) => {
      const slug = vars.projectSlug;
      if (slug) {
        const project = await api.getProject(slug);

        return api.getTasks(vars.page, {
          all_tasks: true,
          type: 'crowdsourcing-task',
          root_task_id: project.task_id,
          ...vars.query,
        });
      }

      return api.getTasks(vars.page, { all_tasks: true, ...vars.query });
    },
  }
);

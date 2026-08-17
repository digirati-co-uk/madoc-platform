import { BaseTask } from '../../../../gateway/tasks/base-task';
import { Status } from '../../../shared/atoms/Status';
import { RootStatistics } from '../../../shared/components/RootStatistics';
import { TableContainer, TableRow, TableRowLabel } from '../../../shared/layout/Table';
import { UniversalComponent } from '../../../types';
import React, { useEffect, useState } from 'react';
import { ExportResourceTask } from './export-resource-task';
import { GenericTask } from './generic-task';
import { ManifestImportTask } from './manifest-import-task';
import type { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import { CollectionImportTask } from './collection-import-task';
import type { ImportCollectionTask } from '../../../../gateway/tasks/import-collection';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/layout/WidePage';
import { useTranslation } from 'react-i18next';
import { SubtaskProgress } from '../../../shared/atoms/SubtaskProgress';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { CanvasSnippet } from '../../../shared/features/CanvasSnippet';
import { Link } from 'react-router-dom';
import { SmallButton } from '../../../shared/navigation/Button';
import { Pagination } from '../../molecules/Pagination';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';

export interface ManifestImportStats {
  statuses: Record<string, number>;
  total: number;
}

type TaskRouterType = {
  query: { page?: number; status?: string };
  params: { id: string };
  data: { task: BaseTask; manifestImportStats?: ManifestImportStats };
  variables: { id: string; page: number; status?: number };
};

function renderTask({ task, manifestImportStats }: TaskRouterType['data'], statusBar?: React.ReactNode) {
  switch (task.type) {
    case 'export-resource-task':
      return <ExportResourceTask task={task as any} statusBar={statusBar} />;
    case 'madoc-manifest-import':
      return <ManifestImportTask task={task as ImportManifestTask} statusBar={statusBar} />;
    case 'madoc-collection-import':
      return (
        <CollectionImportTask
          task={task as ImportCollectionTask & { id: string }}
          manifestImportStats={manifestImportStats}
          statusBar={statusBar}
        />
      );
    case 'madoc-canvas-import': {
      const resourceId: number | undefined = task.state && task.state.resourceId ? task.state.resourceId : undefined;
      if (resourceId) {
        return (
          <div>
            <CanvasSnippet id={resourceId} />
          </div>
        );
      }
      break;
    }
    default:
      return <GenericTask task={task} statusBar={statusBar} />;
  }

  return (
    <div>
      {task.name} ({task.status_text})
      <TableContainer>
        {(task.subtasks || []).map(subtask => (
          <TableRow key={subtask.id} interactive>
            <TableRowLabel>
              <Status status={subtask.status || 0} text={subtask.status_text || 'unknown'} />
            </TableRowLabel>
            <TableRowLabel>
              <Link to={`/tasks/${subtask.id}`}>{subtask.name}</Link>
            </TableRowLabel>
          </TableRow>
        ))}
      </TableContainer>
    </div>
  );
}

export const TaskRouter: UniversalComponent<TaskRouterType> = createUniversalComponent<TaskRouterType>(
  () => {
    const { t } = useTranslation();
    const [isDone, setIsDone] = useState(false);
    const query = useLocationQuery<{ status?: string }>();
    const { latestData: data, status } = usePaginatedData(TaskRouter, undefined, {
      refetchInterval: isDone ? undefined : 2000,
      refetchOnWindowFocus: true,
      keepPreviousData: true,
    });

    useEffect(() => {
      if (data) {
        const stats = data.task.root_statistics;
        const hasOutstandingTasks = stats
          ? stats.error + stats.not_started + stats.accepted + stats.progress > 0
          : false;
        setIsDone((data.task.status === 3 || data.task.status === -1) && !hasOutstandingTasks);
      }
    }, [data]);

    if (status !== 'success' || !data) {
      return <div>Loading...</div>;
    }

    const stats = data.task.root_statistics;
    const hasSubtasks = stats
      ? stats.error + stats.not_started + stats.accepted + stats.progress + stats.done > 0
      : (data.task.subtasks || []).length > 0;

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: t('Site admin'), link: '/' },
            { label: t('Tasks'), link: '/tasks' },
            { label: data.task.name, link: `/tasks/${data.task.name}`, active: true },
          ]}
          title={data.task.name}
          subtitle={data.task.description}
        />
        <WidePage>
          {data.task.parent_task ? (
            <div>
              <SmallButton as={Link} to={`/tasks/${data.task.parent_task}`}>
                Back to parent task
              </SmallButton>
            </div>
          ) : null}
          {renderTask(
            data,
            hasSubtasks ? (
              data.task?.root_statistics ? (
                <RootStatistics {...data.task.root_statistics} />
              ) : (
                <SubtaskProgress
                  total={(data.task.subtasks || []).length}
                  done={(data.task.subtasks || []).filter(e => e.status === 3).length}
                  progress={(data.task.subtasks || []).filter(e => e.status === 2).length}
                />
              )
            ) : (
              <React.Fragment />
            )
          )}
          {data.task.pagination ? (
            <Pagination
              page={data.task.pagination.page}
              totalPages={data.task.pagination.total_pages}
              stale={false}
              extraQuery={{ status: query.status }}
            />
          ) : null}
        </WidePage>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      const task = await api.getTask(vars.id, {
        root_statistics: true,
        page: vars.page,
        status: vars.status,
      });
      let manifestImportStats: ManifestImportStats | undefined;

      if (task.type === 'madoc-collection-import') {
        try {
          manifestImportStats = await api.getTaskStats(vars.id, { type: 'madoc-manifest-import' });
        } catch {
          // The task remains usable if statistics are unavailable.
        }
      }

      return { task, manifestImportStats };
    },
    getKey(params, { page = 1, status: statusQuery }) {
      const status = statusQuery === undefined ? undefined : Number(statusQuery);
      return ['task', { id: params.id, page: Number(page), status: Number.isFinite(status) ? status : undefined }];
    },
  }
);

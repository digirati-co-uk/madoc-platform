import { BaseTask } from '../../../../gateway/tasks/base-task';
import { Status } from '../../../shared/atoms/Status';
import { TableContainer, TableRow, TableRowLabel } from '../../../shared/layout/Table';
import { UniversalComponent } from '../../../types';
import React, { useEffect, useState } from 'react';
import { GenericTask } from './generic-task';
import { ManifestImportTask } from './manifest-import-task';
import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import { CollectionImportTask } from './collection-import-task';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/layout/WidePage';
import { useTranslation } from 'react-i18next';
import { SubtaskProgress } from '../../../shared/atoms/SubtaskProgress';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { CanvasSnippet } from '../../../shared/components/CanvasSnippet';
import { Link } from 'react-router-dom';
import { SmallButton } from '../../../shared/navigation/Button';

type TaskRouterType = {
  query: { page: number };
  params: { id: string };
  data: { task: BaseTask };
  variables: { id: string; page: number };
};

function renderTask({ task }: TaskRouterType['data'], statusBar?: JSX.Element) {
  switch (task.type) {
    case 'madoc-manifest-import':
      return <ManifestImportTask task={task as ImportManifestTask} statusBar={statusBar} />;
    case 'madoc-collection-import':
      return <CollectionImportTask task={task as ImportManifestTask} statusBar={statusBar} />;
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
    const { resolvedData: data, status } = usePaginatedData(TaskRouter, undefined, {
      refetchInterval: isDone ? undefined : 3000,
      refetchOnWindowFocus: false,
    });

    useEffect(() => {
      if (data && data.task.subtasks) {
        if (data.task.subtasks.length === 0 && data.task.status !== 1) {
          setIsDone(true);
        } else if (
          data.task.status !== 1 &&
          (data.task.subtasks || []).filter(e => e.status === 3).length === data.task.subtasks.length
        ) {
          setIsDone(true);
        }
      }
    }, [data]);

    if (status !== 'success' || !data) {
      return <div>Loading...</div>;
    }

    const hasSubtasks = data.task ? (data.task.subtasks || []).length > 0 : false;

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
              <SubtaskProgress
                total={(data.task.subtasks || []).length}
                done={(data.task.subtasks || []).filter(e => e.status === 3).length}
                progress={(data.task.subtasks || []).filter(e => e.status === 2).length}
              />
            ) : (
              <React.Fragment />
            )
          )}
        </WidePage>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      const task = await api.getTaskById(vars.id);
      return { task };
    },
    getKey(params, { page = 1 }) {
      return ['task', { id: params.id, page }];
    },
  }
);

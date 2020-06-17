import { BaseTask } from '../../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../../types';
import React from 'react';
import { ManifestImportTask } from './manifest-import-task';
import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import { CollectionImportTask } from './collection-import-task';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/atoms/WidePage';
import { useTranslation } from 'react-i18next';
import { SubtaskProgress } from '../../../shared/atoms/SubtaskProgress';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { CanvasSnippet } from '../../../shared/components/CanvasSnippet';
import { Link } from 'react-router-dom';
import { SmallButton } from '../../../shared/atoms/Button';

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
  }

  return (
    <div>
      {task.name} ({task.status_text})
    </div>
  );
}

export const TaskRouter: UniversalComponent<TaskRouterType> = createUniversalComponent<TaskRouterType>(
  () => {
    const { t } = useTranslation();
    const { resolvedData: data, status } = usePaginatedData(TaskRouter, undefined, {
      refetchInterval: 3000,
    });

    if (status !== 'success' || !data) {
      return <div>Loading...</div>;
    }

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
            data.task ? (
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

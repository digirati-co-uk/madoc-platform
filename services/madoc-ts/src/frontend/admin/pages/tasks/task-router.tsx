import { BaseTask } from '../../../../gateway/tasks/base-task';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent, usePaginatedData } from '../../utility';
import React from 'react';
import { ManifestImportTask } from './manifest-import-task';
import { ImportManifestTask } from '../../../../gateway/tasks/import-manifest';
import { CollectionImportTask } from './collection-import-task';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../atoms/WidePage';
import { useTranslation } from 'react-i18next';

type TaskRouterType = {
  query: { page: number };
  params: { id: string };
  data: { task: BaseTask };
  variables: { id: string; page: number };
};

function renderTask({ task }: TaskRouterType['data']) {
  switch (task.type) {
    case 'madoc-manifest-import':
      return <ManifestImportTask task={task as ImportManifestTask} />;
    case 'madoc-collection-import':
      return <CollectionImportTask task={task as ImportManifestTask} />;
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
        <WidePage>{renderTask(data)}</WidePage>
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

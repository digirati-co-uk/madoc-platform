import type { ImportCollectionTask } from '../../../../gateway/tasks/import-collection';
import React, { useState } from 'react';
import { Button } from '../../../shared/navigation/Button';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { CollectionSnippet } from '../../../shared/features/CollectionSnippet';
import { CollapsibleTaskList } from '../../molecules/CollapsibleTaskList';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import type { ManifestImportStats } from './task-router';

interface CollectionImportTaskProps {
  task: ImportCollectionTask & { id: string };
  manifestImportStats?: ManifestImportStats;
  statusBar?: React.ReactNode;
}

export function CollectionImportTask({ task, manifestImportStats, statusBar }: CollectionImportTaskProps) {
  const { t } = useTranslation();
  const api = useApi();
  const location = useLocation();
  const navigate = useNavigate();
  const query = useLocationQuery<{ status?: string }>();
  const [taskStatusMap, setTaskStatusMap] = useState<Record<string, boolean>>({});
  const manifestSubtasks = (task.subtasks || []).filter(subtask => subtask.type === 'madoc-manifest-import');
  const manifestTotal = manifestImportStats?.total ?? task.state.manifestIds?.length ?? manifestSubtasks.length;
  const importedTotal =
    manifestImportStats?.statuses?.['3'] ??
    manifestSubtasks.filter(subtask => subtask.status === 3 && subtask.state?.resourceId).length;
  const failedTotal =
    manifestImportStats?.statuses?.['-1'] ?? manifestSubtasks.filter(subtask => subtask.status === -1).length;

  const [trigger] = useMutation(async (taskId: string) => {
    setTaskStatusMap(statuses => ({ ...statuses, [taskId]: true }));

    try {
      await api.updateTask(taskId, { status: 0, status_text: 'pending' });
    } finally {
      setTaskStatusMap(statuses => ({ ...statuses, [taskId]: false }));
    }
  });

  const [retryFailed, retryFailedStatus] = useMutation(async () => {
    await api.updateTask(task.id, { status: 0, status_text: 'pending' });
  });

  return (
    <div>
      <h1>{task.name}</h1>

      {task.state.resourceId ? (
        <CollectionSnippet id={task.state.resourceId} />
      ) : (
        <Button disabled>{t('Waiting for resource')}</Button>
      )}
      <WarningMessage $banner $margin style={{ marginTop: '0.75em' }}>
        <strong>Manifests:</strong> {manifestTotal} · <strong>Imported:</strong> {importedTotal} ·{' '}
        <strong>{t('Failed')}:</strong> {failedTotal}
      </WarningMessage>
      <div className="my-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          {t('Filter by status')}
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2"
            value={query.status || ''}
            onChange={event => {
              const status = event.currentTarget.value;
              navigate(status ? `${location.pathname}?status=${status}` : location.pathname);
            }}
          >
            <option value="">{t('All')}</option>
            <option value="-1">{t('Failed')}</option>
            <option value="3">{t('Done')}</option>
          </select>
        </label>
        {failedTotal > 0 ? (
          <button
            type="button"
            className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={retryFailedStatus.isLoading}
            onClick={() => retryFailed()}
          >
            {t('Re-import failed manifests ({{count}})', { count: failedTotal })}
          </button>
        ) : null}
      </div>
      {retryFailedStatus.isError ? (
        <p role="alert" className="my-3 rounded bg-red-700 p-3 text-white">
          {t('Failed')}: {(retryFailedStatus.error as Error).message}
        </p>
      ) : null}
      {statusBar}
      <CollapsibleTaskList
        tasks={task.subtasks || []}
        trigger={trigger}
        taskStatusMap={taskStatusMap}
        tasksToShow={20}
      />
    </div>
  );
}

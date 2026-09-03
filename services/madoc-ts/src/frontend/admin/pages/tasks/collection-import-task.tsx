import type { ImportCollectionTask } from '../../../../gateway/tasks/import-collection';
import React, { useState } from 'react';
import { Button } from '../../../shared/navigation/Button';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { CollectionSnippet } from '../../../shared/features/CollectionSnippet';
import { CollapsibleTaskList } from '../../molecules/CollapsibleTaskList';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import type { ManifestImportStats } from './task-router';
import { estimateRemainingSeconds } from '../../../shared/utility/estimated-time-remaining';
import { EstimatedTimeRemaining } from './EstimatedTimeRemaining';

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
  const manifestTotal = task.state.manifestIds?.length ?? manifestImportStats?.total ?? manifestSubtasks.length;
  const importedTotal =
    manifestImportStats?.statuses?.['3'] ??
    manifestSubtasks.filter(subtask => subtask.status === 3 && subtask.state?.resourceId).length;
  const failedTotal =
    manifestImportStats?.statuses?.['-1'] ?? manifestSubtasks.filter(subtask => subtask.status === -1).length;
  const remainingTotal = Math.max(0, manifestTotal - importedTotal - failedTotal);
  const importedPercent = manifestTotal > 0 ? Math.min(100, (importedTotal / manifestTotal) * 100) : 0;
  const failedPercent = manifestTotal > 0 ? Math.min(100 - importedPercent, (failedTotal / manifestTotal) * 100) : 0;
  const etaSeconds = estimateRemainingSeconds(task.created_at, importedTotal, remainingTotal);
  const canCompleteWithFailures =
    task.status !== 3 &&
    !task.state.skipFailedManifests &&
    failedTotal > 0 &&
    manifestImportStats?.total === manifestTotal &&
    importedTotal + failedTotal === manifestImportStats.total;

  const [trigger] = useMutation(async (taskId: string) => {
    setTaskStatusMap(statuses => ({ ...statuses, [taskId]: true }));

    try {
      await api.updateTask(taskId, { status: 0, status_text: 'pending' });
    } finally {
      setTaskStatusMap(statuses => ({ ...statuses, [taskId]: false }));
    }
  });

  const [retryFailed, retryFailedStatus] = useMutation(async () => {
    await api.updateTask(task.id, {
      status: 0,
      status_text: 'pending',
      state: { skipFailedManifests: false },
    });
  });

  const [completeWithFailures, completeWithFailuresStatus] = useMutation(async () => {
    if (!window.confirm(t('Complete this collection without the failed manifests?'))) {
      return;
    }
    await api.updateTask(task.id, {
      status: 0,
      status_text: 'completing without failed manifests',
      state: { skipFailedManifests: true },
    });
  });

  return (
    <div>
      <h1>{task.name}</h1>

      {task.state.resourceId ? (
        <CollectionSnippet id={task.state.resourceId} />
      ) : (
        <Button disabled>{t('Waiting for resource')}</Button>
      )}
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <dl
          aria-label={t('Collection import statistics')}
          className="inline-flex overflow-hidden rounded border border-slate-200 bg-slate-50 text-sm shadow-sm"
        >
          <div className="flex items-center gap-2 px-3 py-2">
            <dt className="text-slate-500">{t('Manifests')}</dt>
            <dd className="font-semibold tabular-nums text-slate-900">{manifestTotal}</dd>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 px-3 py-2">
            <dt className="flex items-center gap-2 text-slate-500">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-green-600" />
              {t('Imported')}
            </dt>
            <dd className="font-semibold tabular-nums text-slate-900">{importedTotal}</dd>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-200 px-3 py-2">
            <dt className="flex items-center gap-2 text-slate-500">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${failedTotal > 0 ? 'bg-red-600' : 'bg-slate-300'}`}
              />
              {t('Failed')}
            </dt>
            <dd className="font-semibold tabular-nums text-slate-900">{failedTotal}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center gap-3">
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
          {canCompleteWithFailures ? (
            <button
              type="button"
              className="rounded bg-amber-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={completeWithFailuresStatus.isLoading || completeWithFailuresStatus.isSuccess}
              onClick={() => completeWithFailures()}
            >
              {t('Complete without failed manifests ({{count}})', { count: failedTotal })}
            </button>
          ) : null}
        </div>
      </div>
      {retryFailedStatus.isError || completeWithFailuresStatus.isError ? (
        <p role="alert" className="my-3 rounded bg-red-700 p-3 text-white">
          {t('Failed')}: {((retryFailedStatus.error || completeWithFailuresStatus.error) as Error).message}
        </p>
      ) : null}
      {manifestImportStats && manifestTotal > 0 ? (
        <div className="my-4">
          <div
            role="progressbar"
            aria-label={t('Imported {{imported}} of {{expected}} manifests', {
              imported: importedTotal,
              expected: manifestTotal,
            })}
            aria-valuemin={0}
            aria-valuemax={manifestTotal}
            aria-valuenow={Math.min(importedTotal, manifestTotal)}
            className="flex h-4 overflow-hidden rounded bg-slate-200"
          >
            <div className="bg-green-600 transition-[width]" style={{ width: `${importedPercent}%` }} />
            {failedPercent > 0 ? (
              <div className="bg-red-600 transition-[width]" style={{ width: `${failedPercent}%` }} />
            ) : null}
          </div>
          {remainingTotal > 0 && task.status !== -1 ? <EstimatedTimeRemaining seconds={etaSeconds} /> : null}
        </div>
      ) : (
        statusBar
      )}
      <CollapsibleTaskList
        tasks={task.subtasks || []}
        trigger={trigger}
        taskStatusMap={taskStatusMap}
        tasksToShow={20}
      />
    </div>
  );
}

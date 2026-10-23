import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useApi } from '../../../../shared/hooks/use-api';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { Button } from '../../../../shared/navigation/Button';
import { HrefLink } from '../../../../shared/utility/href-link';

export type RestartTarget = 'queue' | 'madoc' | 'auth' | 'scheduler';
type MigrationId = 'models' | 'project-members' | 'invalid-users' | 'iiif-backfill';

const migrations: { id: MigrationId; label: string; help: string }[] = [
  { id: 'models', label: 'Legacy capture models', help: 'Migrates legacy models (current site).' },
  { id: 'project-members', label: 'Project members', help: 'Migrates project members.' },
  { id: 'invalid-users', label: 'Invalid users', help: 'Removes users with invalid emails.' },
  { id: 'iiif-backfill', label: 'IIIF properties backfill', help: 'Runs for ALL sites as one global task.' },
];
const restarts: { id: RestartTarget; label: string }[] = [
  { id: 'madoc', label: 'Server (madoc)' },
  { id: 'queue', label: 'Queue' },
  { id: 'auth', label: 'Auth' },
  { id: 'scheduler', label: 'Scheduler' },
];

const selectClass = 'rounded border border-gray-300 bg-white px-2 py-1.5 text-sm disabled:opacity-50 min-w-[14rem]';

function errorText(e: unknown) {
  return e instanceof Error ? e.message : 'Request failed';
}

export function SystemActions(props: { onRestart?: (t: RestartTarget) => void }) {
  const api = useApi();
  const [migration, setMigration] = useState<MigrationId | ''>('');
  const [restartTarget, setRestartTarget] = useState<RestartTarget | ''>('');
  const [lastRun, setLastRun] = useState<MigrationId | null>(null);
  const {
    data: backfill,
    refetch: refreshBackfill,
    error: backfillError,
  } = useQuery(['iiif-backfill-status'], () => api.getIIIFBackfillStatus(), { refetchInterval: 5000 });
  const backfillRunning = !!backfill?.task && [0, 1, 2].includes(backfill.task.status ?? 0);

  const [restart, restartStatus] = useMutation(async (s: RestartTarget) => api.pm2Restart(s), {
    onSuccess: (_, s) => props.onRestart?.(s),
  });

  const [runMigration, migrationStatus] = useMutation(
    async (id: MigrationId): Promise<{ id?: string; complete?: boolean } | undefined> => {
      switch (id) {
        case 'models':
          return api.request(`/api/madoc/crowdsourcing/model/migrate`, { method: 'POST' });
        case 'project-members':
          return api.request(`/api/madoc/system/migrate-project-members`, { method: 'POST' });
        case 'invalid-users':
          return api.request(`/api/madoc/system/migrate-invalid-users`, { method: 'POST' });
        case 'iiif-backfill':
          const task = await api.startIIIFBackfill();
          await refreshBackfill();
          return task;
      }
    }
  );

  const selected = migrations.find(m => m.id === migration);
  const result = migrationStatus.data as { id?: string | number; complete?: boolean } | undefined;

  return (
    <section className="mb-6 grid gap-4 rounded border border-gray-200 bg-white p-4 md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-base font-semibold">Maintenance</h3>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Migration"
            className={selectClass}
            value={migration}
            disabled={migrationStatus.isLoading}
            onChange={e => setMigration(e.target.value as MigrationId | '')}
          >
            <option value="">Select a migration…</option>
            {migrations.map(m => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <Button
            disabled={!migration || migrationStatus.isLoading || (migration === 'iiif-backfill' && backfillRunning)}
            onClick={() => {
              if (!migration) return;
              setLastRun(migration);
              runMigration(migration);
            }}
          >
            {migrationStatus.isLoading ? 'Running…' : 'Run'}
          </Button>
        </div>
        {selected ? <p className="mt-1 text-sm text-gray-600">{selected.help}</p> : null}
        <div className="mt-2" aria-live="polite">
          {migrationStatus.isError ? <ErrorMessage>{errorText(migrationStatus.error)}</ErrorMessage> : null}
          {migrationStatus.isSuccess ? (
            result?.complete ? (
              <SuccessMessage>Nothing to migrate</SuccessMessage>
            ) : result?.id ? (
              <SuccessMessage>
                Started <HrefLink href={`/tasks/${result.id}`}>Go to task</HrefLink>
              </SuccessMessage>
            ) : (
              <SuccessMessage>{migrations.find(m => m.id === lastRun)?.label} complete</SuccessMessage>
            )
          ) : null}
        </div>
        {backfillError ? (
          <p role="alert" className="mt-2 text-sm text-red-700">
            Could not load backfill status.
          </p>
        ) : null}
        {backfill?.task ? (
          <div className="mt-3 rounded bg-gray-50 p-3 text-sm" aria-live="polite">
            <div className="font-medium">
              IIIF properties backfill ·{' '}
              {backfillRunning ? 'Running' : backfill.task.status === 3 ? 'Finished' : 'Finished with errors'}
            </div>
            <p className="mt-1">
              {backfill.task.state.processed}/{backfill.task.state.total} manifests processed ·{' '}
              {backfill.task.state.queued} restored · {backfill.task.state.skipped} skipped ·{' '}
              {backfill.task.state.failed} failed
            </p>
            <p className="mt-1 text-gray-600">
              Annotation downloads run as separate tasks after each source is restored.
            </p>
            <HrefLink href={`/tasks/${backfill.task.id}`}>View progress and failures</HrefLink>
          </div>
        ) : null}
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold">Restart service</h3>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Service to restart"
            className={selectClass}
            value={restartTarget}
            disabled={restartStatus.isLoading}
            onChange={e => setRestartTarget(e.target.value as RestartTarget | '')}
          >
            <option value="">Select a service…</option>
            {restarts.map(r => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <Button
            disabled={!restartTarget || restartStatus.isLoading}
            onClick={() => {
              if (!restartTarget) return;
              restart(restartTarget);
            }}
          >
            {restartStatus.isLoading ? 'Restarting…' : 'Restart'}
          </Button>
        </div>
        <div className="mt-2" aria-live="polite">
          {restartStatus.isError ? <ErrorMessage>{errorText(restartStatus.error)}</ErrorMessage> : null}
          {restartStatus.isSuccess ? <SuccessMessage>Restart requested</SuccessMessage> : null}
        </div>
      </div>
    </section>
  );
}

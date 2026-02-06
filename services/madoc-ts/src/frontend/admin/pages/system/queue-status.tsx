import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { BullMqJobSummary, BullMqSnapshot, BullMqState } from '../../../../types/bullmq-status';
import { Pm2Status } from '../../../../types/pm2';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../../shared/atoms/Statistics';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { useUser } from '../../../shared/hooks/use-site';
import { WidePage } from '../../../shared/layout/WidePage';
import { HrefLink } from '../../../shared/utility/href-link';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { AdminHeader } from '../../molecules/AdminHeader';

const STATE_ORDER: BullMqState[] = ['active', 'wait', 'delayed', 'failed', 'paused', 'completed'];
const STATE_LABELS: Record<BullMqState, string> = {
  active: 'Active',
  wait: 'Waiting',
  delayed: 'Delayed',
  failed: 'Failed',
  paused: 'Paused',
  completed: 'Completed',
};

function formatTime(timestamp: number | null) {
  if (!timestamp) {
    return '-';
  }
  return new Date(timestamp).toLocaleString();
}

function formatDuration(job: BullMqJobSummary) {
  if (!job.processedOn || !job.finishedOn) {
    return '-';
  }
  return `${((job.finishedOn - job.processedOn) / 1000).toFixed(2)}s`;
}

function formatMemory(bytes: number) {
  return `${(Math.round((bytes / 1000 / 10) * 100) / 100).toFixed(2)}mb`;
}

type ProgressMetrics = {
  remaining: number;
  observedCompleted: number;
  observedTotal: number;
  progress: number;
  etaSeconds: number | null;
  sampleCount: number;
  observationDurationMs: number;
  completionRatePerMinute: number | null;
};

function formatEta(seconds: number) {
  if (seconds < 60) {
    return `${Math.max(1, Math.round(seconds))}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  return `${minutes}m ${secs}s`;
}

function useObservedQueueProgress(data?: BullMqSnapshot): ProgressMetrics {
  const completedBaseline = useRef<number | null>(null);
  const completionSamples = useRef<Array<{ time: number; completed: number }>>([]);
  const hasData = !!data;
  const waitCount = data?.counts.wait || 0;
  const activeCount = data?.counts.active || 0;
  const delayedCount = data?.counts.delayed || 0;
  const pausedCount = data?.counts.paused || 0;
  const completedCount = data?.counts.completed || 0;
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    remaining: 0,
    observedCompleted: 0,
    observedTotal: 0,
    progress: 0,
    etaSeconds: null,
    sampleCount: 0,
    observationDurationMs: 0,
    completionRatePerMinute: null,
  });

  useEffect(() => {
    if (!hasData) {
      return;
    }

    const now = Date.now();
    const remaining = waitCount + activeCount + delayedCount + pausedCount;
    const completed = completedCount;

    if (completedBaseline.current === null || completed < completedBaseline.current) {
      completedBaseline.current = completed;
      completionSamples.current = [{ time: now, completed }];
    } else {
      completionSamples.current = [...completionSamples.current, { time: now, completed }].slice(-120);
    }

    const samples = completionSamples.current;
    const firstSample = samples[0];
    const lastSample = samples[samples.length - 1];
    const observedCompleted = Math.max(0, completed - (completedBaseline.current || 0));
    const observationDurationMs = firstSample ? Math.max(0, lastSample.time - firstSample.time) : 0;
    const completionRatePerSecond =
      observationDurationMs > 0 && observedCompleted > 0 ? observedCompleted / (observationDurationMs / 1000) : 0;
    const observedTotal = observedCompleted + remaining;
    const progress = observedTotal > 0 ? observedCompleted / observedTotal : remaining === 0 ? 1 : 0;
    const etaSeconds = completionRatePerSecond > 0 ? remaining / completionRatePerSecond : null;

    setMetrics({
      remaining,
      observedCompleted,
      observedTotal,
      progress,
      etaSeconds,
      sampleCount: samples.length,
      observationDurationMs,
      completionRatePerMinute: completionRatePerSecond > 0 ? completionRatePerSecond * 60 : null,
    });
  }, [hasData, waitCount, activeCount, delayedCount, pausedCount, completedCount]);

  return metrics;
}

type QueueStatusType = {
  data: BullMqSnapshot;
  query: unknown;
  params: unknown;
  variables: unknown;
};

export const QueueStatus: UniversalComponent<QueueStatusType> = createUniversalComponent<QueueStatusType>(
  () => {
    const { t } = useTranslation();
    const user = useUser();
    const api = useApi();
    const isGlobalAdmin = user?.role === 'global_admin';

    const { data } = useData(QueueStatus, undefined, {
      enabled: isGlobalAdmin,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    });
    const { data: pm2Data } = useQuery(['queue-status-pm2'], () => api.getPm2Status(), {
      enabled: isGlobalAdmin,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    });
    const progressMetrics = useObservedQueueProgress(data);
    const progressPercent = Math.max(0, Math.min(100, progressMetrics.progress * 100));
    const observedSeconds = Math.round(progressMetrics.observationDurationMs / 1000);

    if (!isGlobalAdmin) {
      return <Navigate to={'/'} />;
    }

    const workerProcesses = useMemo(
      () => (pm2Data?.list || []).filter(proc => proc.name === 'queue' || proc.name === 'scheduler'),
      [pm2Data]
    );

    const states = useMemo(
      () => STATE_ORDER.filter(state => state !== 'completed' || data?.queue.includeCompleted),
      [data?.queue.includeCompleted]
    );

    return (
      <>
        <AdminHeader
          title={t('Queue inspector')}
          breadcrumbs={[
            { label: t('Site admin'), link: '/' },
            { label: t('Global queue'), link: '/global/queue', active: true },
          ]}
        />

        <StatisticContainer>
          <Statistic>
            <StatisticNumber>{data?.counts.wait || 0}</StatisticNumber>
            <StatisticLabel>{t('Waiting')}</StatisticLabel>
          </Statistic>
          <Statistic>
            <StatisticNumber>{data?.counts.active || 0}</StatisticNumber>
            <StatisticLabel>{t('Active')}</StatisticLabel>
          </Statistic>
          <Statistic>
            <StatisticNumber>{data?.counts.delayed || 0}</StatisticNumber>
            <StatisticLabel>{t('Delayed')}</StatisticLabel>
          </Statistic>
          <Statistic>
            <StatisticNumber>{data?.counts.failed || 0}</StatisticNumber>
            <StatisticLabel>{t('Failed')}</StatisticLabel>
          </Statistic>
          <Statistic>
            <StatisticNumber>{data?.counts.completed || 0}</StatisticNumber>
            <StatisticLabel>{t('Completed')}</StatisticLabel>
          </Statistic>
          <Statistic>
            <StatisticNumber>{data?.counts.paused || 0}</StatisticNumber>
            <StatisticLabel>{t('Paused')}</StatisticLabel>
          </Statistic>
        </StatisticContainer>

        <WidePage>
          {data ? (
            <p>
              Refreshing every 5 seconds. Showing up to {data.queue.limitPerState} jobs per state.
              {data.queue.includeCompleted ? ' Completed jobs are included in this snapshot.' : ''}
            </p>
          ) : null}

          {data?.available === false ? (
            <div
              style={{
                border: '1px solid #f0c7c7',
                background: '#fff3f3',
                padding: 12,
                borderRadius: 4,
                marginBottom: 20,
              }}
            >
              <strong>Queue is unavailable.</strong>
              <div>{data.error || 'Could not retrieve queue status.'}</div>
            </div>
          ) : null}

          <h3>Observed progress (errors excluded)</h3>
          <p>
            Progress tracks only waiting, active, delayed and paused jobs against completed jobs while this page is
            open. Failed jobs are excluded.
          </p>
          <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 4, marginBottom: 30 }}>
            <div style={{ height: 12, background: '#e8e8e8', borderRadius: 9999, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: '#4b67e1',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <strong>{progressPercent.toFixed(1)}%</strong>
              <span>
                {progressMetrics.observedCompleted} completed / {progressMetrics.observedTotal} tracked
              </span>
              <span>Remaining: {progressMetrics.remaining}</span>
              <span>Failed excluded: {data?.counts.failed || 0}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              {progressMetrics.etaSeconds !== null ? (
                <>
                  Estimated time remaining: <strong>{formatEta(progressMetrics.etaSeconds)}</strong> at ~
                  {progressMetrics.completionRatePerMinute?.toFixed(2)} jobs/min (from {progressMetrics.sampleCount}{' '}
                  samples over {observedSeconds}s).
                </>
              ) : (
                <>Estimating time remaining. Keep this page open to improve accuracy.</>
              )}
            </div>
          </div>

          <h3>Workers</h3>
          {workerProcesses.length === 0 ? (
            <p>Queue/scheduler PM2 processes were not found in the latest PM2 snapshot.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 30 }}>
              {workerProcesses.map((proc: Pm2Status) => {
                return (
                  <div key={proc.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 4 }}>
                    <strong>{proc.name}</strong>
                    <div>Status: {proc.status}</div>
                    <div>CPU: {proc.monit.cpu}%</div>
                    <div>Memory: {formatMemory(proc.monit.memory)}</div>
                    <div>Restarted: {proc.uptime ? new Date(proc.uptime).toLocaleString() : '-'}</div>
                  </div>
                );
              })}
            </div>
          )}

          <h3>Sampled task types</h3>
          <p>
            Based on {data?.taskTypes.sampledTotal || 0} sampled jobs from the current queue snapshot. Use this to
            quickly identify which task handlers are currently active or backlogged.
          </p>
          {data?.taskTypes.byType.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="p-2 w-full" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th align="left">Task type</th>
                    <th align="left">Sampled jobs</th>
                    <th align="left">State breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {data.taskTypes.byType.map(taskType => (
                    <tr key={taskType.type}>
                      <td className="p-2">{taskType.type}</td>
                      <td className="p-2">{taskType.total}</td>
                      <td className="p-2">
                        {Object.entries(taskType.states)
                          .map(([state, total]) => `${STATE_LABELS[state as BullMqState]}: ${total}`)
                          .join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No sampled jobs available yet.</p>
          )}

          {states.map(state => {
            const jobs = data?.jobs[state] || [];
            return (
              <div key={state} style={{ marginTop: 28 }}>
                <h3>
                  {STATE_LABELS[state]} jobs ({data?.counts[state] || 0} total, {jobs.length} shown)
                </h3>
                {jobs.length === 0 ? (
                  <p>No jobs sampled for this state.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="p-2 w-full" style={{ minWidth: 1300 }}>
                      <thead>
                        <tr>
                          <th align="left">Job ID</th>
                          <th align="left">Task</th>
                          <th align="left">Type / Name</th>
                          <th align="left">Attempts</th>
                          <th align="left">Progress</th>
                          <th align="left">Queued</th>
                          <th align="left">Started</th>
                          <th align="left">Finished</th>
                          <th align="left">Duration</th>
                          <th align="left">Delay/Priority</th>
                          <th align="left">Failure</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(job => (
                          <tr key={`${state}-${job.id}`}>
                            <td className="p-2">{job.id}</td>
                            <td className="p-2">
                              {job.taskId ? <HrefLink href={`/tasks/${job.taskId}`}>{job.taskId}</HrefLink> : '-'}
                              {job.dataSummary.siteId ? (
                                <div style={{ fontSize: '0.8em', color: '#666' }}>site:{job.dataSummary.siteId}</div>
                              ) : null}
                            </td>
                            <td className="p-2">
                              <div>{job.type}</div>
                              <div style={{ fontSize: '0.8em', color: '#666' }}>{job.name}</div>
                            </td>
                            <td className="p-2">
                              {job.attemptsMade}
                              {job.attempts ? ` / ${job.attempts}` : ''}
                            </td>
                            <td className="p-2">{job.progress === null ? '-' : job.progress}</td>
                            <td className="p-2">{formatTime(job.timestamp)}</td>
                            <td className="p-2">{formatTime(job.processedOn)}</td>
                            <td className="p-2">{formatTime(job.finishedOn)}</td>
                            <td className="p-2">{formatDuration(job)}</td>
                            <td className="p-2">
                              {job.delay ? `${job.delay}ms` : '-'}
                              {job.priority !== null ? ` / p${job.priority}` : ''}
                            </td>
                            <td className="p-2">
                              {job.failedReason || job.stacktrace[0] || '-'}
                              {job.dataSummary.contextSize > 0 ? (
                                <div style={{ fontSize: '0.8em', color: '#666' }}>
                                  {job.dataSummary.context.slice(0, 2).join(', ')}
                                  {job.dataSummary.contextSize > 2 ? ` (+${job.dataSummary.contextSize - 2})` : ''}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </WidePage>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return api.getQueueStatus({
        limit: 25,
        includeCompleted: true,
      });
    },
    getKey() {
      return ['queue-status', {}];
    },
  }
);

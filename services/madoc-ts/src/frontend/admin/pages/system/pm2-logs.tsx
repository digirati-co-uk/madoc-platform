import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Pm2LogEvent, Pm2Status } from '../../../../types/pm2';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { useLocationState } from '../../../shared/hooks/use-location-state';
import { useUser } from '../../../shared/hooks/use-site';
import { WidePage } from '../../../shared/layout/WidePage';
import { Button } from '../../../shared/navigation/Button';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { AdminHeader } from '../../molecules/AdminHeader';

const MAX_VISIBLE_LINES = 5_000;
const TAIL_OPTIONS = [50, 100, 200, 500];

type ConnectionStatus = 'paused' | 'connecting' | 'following' | 'disconnected';

function usePm2LogStream(url: string | undefined, following: boolean) {
  const [logs, setLogs] = useState<Pm2LogEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('paused');
  const [error, setError] = useState<string>();

  useEffect(() => {
    setLogs([]);
    setError(undefined);
  }, [url]);

  useEffect(() => {
    if (!url || !following) {
      setStatus('paused');
      return;
    }

    setStatus('connecting');
    setError(undefined);
    const source = new EventSource(url);

    source.addEventListener('ready', () => setStatus('following'));
    source.addEventListener('log', event => {
      const entry = JSON.parse((event as MessageEvent).data) as Pm2LogEvent;
      // ponytail: bounded DOM buffer; add virtualisation only if longer sessions are required.
      setLogs(previous => [...previous, entry].slice(-MAX_VISIBLE_LINES));
    });
    source.addEventListener('stream-error', event => {
      const data = JSON.parse((event as MessageEvent).data) as { message: string };
      setError(data.message);
      setStatus('disconnected');
      source.close();
    });
    source.addEventListener('end', () => {
      setError('The PM2 log follower exited.');
      setStatus('disconnected');
      source.close();
    });
    source.onerror = () => {
      setError('The log connection was lost.');
      setStatus('disconnected');
      source.close();
    };

    return () => source.close();
  }, [url, following]);

  return { logs, clear: () => setLogs([]), status, error };
}

interface Pm2LogsPage {
  data: { list: Pm2Status[] };
  query: { process?: string };
  params: unknown;
  variables: unknown;
}

export const Pm2Logs: UniversalComponent<Pm2LogsPage> = createUniversalComponent<Pm2LogsPage>(
  () => {
    const { t } = useTranslation();
    const api = useApi();
    const user = useUser();
    const isGlobalAdmin = user?.role === 'global_admin';
    const [query, setQuery] = useLocationState<{ process?: string }>();
    const { data } = useData(Pm2Logs, undefined, {
      enabled: isGlobalAdmin,
      refetchInterval: 5_000,
      refetchIntervalInBackground: true,
    });
    const requestedId = typeof query.process === 'string' ? Number(query.process) : undefined;
    const selectedProcess = useMemo(
      () => data?.list.find(process => process.id === requestedId) || data?.list[0],
      [data?.list, requestedId]
    );
    const [tailLines, setTailLines] = useState(100);
    const [following, setFollowing] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const [errorsOnly, setErrorsOnly] = useState(false);
    const panel = useRef<HTMLDivElement>(null);
    const streamUrl = selectedProcess ? api.getPm2LogsUrl(selectedProcess.id, tailLines) : undefined;
    const stream = usePm2LogStream(streamUrl, following);
    const visibleLogs = useMemo(
      () => (errorsOnly ? stream.logs.filter(line => line.stream === 'stderr') : stream.logs),
      [errorsOnly, stream.logs]
    );

    useEffect(() => {
      if (autoScroll && panel.current) {
        panel.current.scrollTop = panel.current.scrollHeight;
      }
    }, [autoScroll, visibleLogs]);

    if (!isGlobalAdmin) {
      return <Navigate to="/" />;
    }

    return (
      <>
        <AdminHeader
          title={t('Process logs')}
          breadcrumbs={[
            { label: t('Site admin'), link: '/' },
            { label: t('System status'), link: '/global/status' },
            { label: t('Process logs'), link: '/global/logs', active: true },
          ]}
        />
        <WidePage>
          <p className="mb-4 text-sm text-slate-700">
            {t('Logs may contain sensitive operational data. Do not share them outside authorised support channels.')}
          </p>

          <div className="mb-4 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium">
              {t('PM2 process')}
              <select
                className="min-w-48 rounded border border-slate-300 bg-white px-3 py-2"
                value={selectedProcess?.id ?? ''}
                disabled={!data?.list.length}
                onChange={event => {
                  setFollowing(true);
                  setQuery({ process: event.currentTarget.value });
                }}
              >
                {(data?.list || []).map(process => (
                  <option key={process.id} value={process.id}>
                    {process.name} #{process.id} — {process.status}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium">
              {t('Initial lines')}
              <select
                className="rounded border border-slate-300 bg-white px-3 py-2"
                value={tailLines}
                onChange={event => {
                  setFollowing(true);
                  setTailLines(Number(event.currentTarget.value));
                }}
              >
                {TAIL_OPTIONS.map(lines => (
                  <option key={lines} value={lines}>
                    {lines}
                  </option>
                ))}
              </select>
            </label>

            <Button $primary={!following} onClick={() => setFollowing(current => !current)} disabled={!selectedProcess}>
              {following ? t('Pause') : t('Follow')}
            </Button>
            <Button onClick={stream.clear}>{t('Clear')}</Button>

            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={event => setAutoScroll(event.currentTarget.checked)}
              />
              {t('Auto-scroll')}
            </label>

            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={errorsOnly}
                onChange={event => setErrorsOnly(event.currentTarget.checked)}
              />
              {t('Errors only')}
            </label>

            <span role="status" className="pb-2 text-sm text-slate-600">
              {t('Status')}: {t(stream.status)}
            </span>
          </div>

          {stream.error ? <p className="mb-3 text-sm text-red-700">{stream.error}</p> : null}
          {!selectedProcess ? <p>{t('No PM2 processes are currently available.')}</p> : null}

          <div
            ref={panel}
            role="log"
            aria-live="off"
            aria-label={t('PM2 log output')}
            tabIndex={0}
            className="h-[65vh] overflow-auto rounded bg-slate-950 p-4 font-mono text-sm text-slate-100"
          >
            {visibleLogs.map((line, index) => (
              <div key={index} className={line.stream === 'stderr' ? 'text-red-300' : undefined}>
                <span className="select-none text-slate-500">[{line.stream}]</span> {line.message}
              </div>
            ))}
          </div>
        </WidePage>
      </>
    );
  },
  {
    getData: async (key, vars, api) => api.getPm2Status(),
    getKey: () => ['pm2-logs-processes', {}],
  }
);

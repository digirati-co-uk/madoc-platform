import React from 'react';
import { useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { Pm2StatusResponse } from '../../../../types/pm2';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { useUser } from '../../../shared/hooks/use-site';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { AdminHeader } from '../../molecules/AdminHeader';
import { SystemActions } from './components/SystemActions';
import { ProcessGroups } from './components/ProcessGroups';
import { SlowRequestsTable } from './components/SlowRequestsTable';

type SystemStatusType = {
  data: Pm2StatusResponse;
  query: unknown;
  params: unknown;
  variables: unknown;
};

function StatusContent() {
  const api = useApi();
  const { data, error } = useData(SystemStatus, undefined, { refetchInterval: 5000 });
  const { data: systemCheck, isError: systemCheckFailed } = useQuery(['systemCheck'], () => api.system.systemCheck());
  const memory = data?.list.reduce((sum, process) => sum + process.monit.memory, 0) || 0;
  const cpu = data?.list.reduce((sum, process) => sum + process.monit.cpu, 0) || 0;
  const online = data?.list.filter(process => process.status === 'online').length || 0;

  return (
    <>
      <AdminHeader title="System status" breadcrumbs={[{ label: 'Site admin', link: '/' }]} />
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 lg:p-6">
        {error ? (
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">
            Could not load system status.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Processes online', data ? `${online}/${data.list.length}` : '…'],
            ['Memory', data ? `${Math.round(memory / 1024 / 1024)} MB` : '…'],
            ['CPU total', data ? `${cpu.toFixed(1)}%` : '…'],
            [
              'Email',
              systemCheck
                ? systemCheck.email.enabled
                  ? 'Running'
                  : 'Not configured'
                : systemCheckFailed
                  ? 'Unavailable'
                  : 'Checking…',
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-600">{label}</div>
              <div className="mt-1 text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </div>
        {data ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
            <span>
              Version:{' '}
              {data.build.version.startsWith('v') ? (
                <a
                  className="text-blue-700 hover:underline"
                  href={`https://github.com/digirati-co-uk/madoc-platform/releases/tag/${data.build.version}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {data.build.version}
                </a>
              ) : (
                data.build.version
              )}
            </span>
            <span>
              Revision:{' '}
              {data.build.revision === 'unknown' ? (
                'unknown'
              ) : (
                <a
                  className="text-blue-700 hover:underline"
                  href={`https://github.com/digirati-co-uk/madoc-platform/commit/${data.build.revision}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {data.build.revision}
                </a>
              )}
            </span>
            {data.build.time !== 'unknown' ? (
              <span>
                Built <TimeAgo date={new Date(data.build.time)} />
              </span>
            ) : null}
          </div>
        ) : null}
        {systemCheck?.email.issues.length ? (
          <details className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <summary className="cursor-pointer font-medium">Email configuration details</summary>
            <p className="mt-2">{systemCheck.email.issues.join(' · ')}</p>
          </details>
        ) : null}
        <SystemActions />
        {data ? <ProcessGroups list={data.list} /> : <p role="status">Loading processes…</p>}
        {data?.slowRequestsError ? (
          <p role="alert" className="text-sm text-amber-800">
            {data.slowRequestsError}
          </p>
        ) : null}
        {data ? <SlowRequestsTable slowRequests={data.slowRequests} instances={data.slowRequestInstances} /> : null}
      </div>
    </>
  );
}

export const SystemStatus: UniversalComponent<SystemStatusType> = createUniversalComponent<SystemStatusType>(
  () => {
    const user = useUser();
    return user?.role === 'global_admin' ? <StatusContent /> : <Navigate to="/" />;
  },
  {
    async getData(key, vars, api) {
      return api.getPm2Status();
    },
    getKey() {
      return ['pm2-status', {}];
    },
  }
);

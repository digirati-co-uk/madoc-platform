import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { EnvConfig } from '../../../../types/env-config';
import { Pm2Status } from '../../../../types/pm2';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../../shared/atoms/Statistics';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { useApi } from '../../../shared/hooks/use-api';
import { WidePage } from '../../../shared/layout/WidePage';
import { useData } from '../../../shared/hooks/use-data';
import { useUser } from '../../../shared/hooks/use-site';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { HrefLink } from '../../../shared/utility/href-link';
import { UniversalComponent } from '../../../types';
import { AdminHeader } from '../../molecules/AdminHeader';
import { SlowRequests } from '../../../../middleware/slow-requests';
import { TableContainer, TableRow, TableRowLabel } from '../../../shared/layout/Table';

type SystemStatusType = {
  data: { list: Pm2Status[]; build: EnvConfig['build']; slowRequests: SlowRequests };
  query: unknown;
  params: unknown;
  variables: unknown;
};

export const SystemStatus: UniversalComponent<SystemStatusType> = createUniversalComponent<SystemStatusType>(
  () => {
    const user = useUser();

    if (user?.role !== 'global_admin') {
      return <Navigate to={'/'} />;
    }

    const { t } = useTranslation();
    const api = useApi();
    const { data } = useData(SystemStatus, undefined, {
      refetchInterval: 1000,
    });

    const { data: systemCheck } = useQuery(['systemCheck'], () => {
      return api.system.systemCheck();
    });

    const [restart, restartStatus] = useMutation(async (service: 'queue' | 'madoc' | 'auth' | 'scheduler') => {
      return api.pm2Restart(service);
    });

    const [migrateModels, migrateModelsStatus] = useMutation(async () => {
      return api.request(`/api/madoc/crowdsourcing/model/migrate`, {
        method: 'POST',
      });
    });

    const [migrateProjectMembers, migrateProjectMembersStatus] = useMutation(async () => {
      return api.request(`/api/madoc/system/migrate-project-members`, {
        method: 'POST',
      });
    });

    const [migrateInvalidUsers, migrateInvalidUsersStatus] = useMutation(async () => {
      return api.request(`/api/madoc/system/migrate-invalid-users`, {
        method: 'POST',
      });
    });

    const { memory, cpu } = data
      ? data.list.reduce(
          (state, next) => {
            return {
              memory: state.memory + next.monit.memory,
              cpu: state.cpu + next.monit.cpu,
            };
          },
          { memory: 0, cpu: 0 }
        )
      : { memory: 0, cpu: 0 };

    const slowestRequests = Object.values(data?.slowRequests || {}).sort((a, b) => b.slowest - a.slowest);

    return (
      <>
        <AdminHeader title={t('System status')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} />

        <StatisticContainer>
          <Statistic>
            <StatisticNumber>{Math.round(memory / 1000 / 10) / 100}mb</StatisticNumber>
            <StatisticLabel>Memory</StatisticLabel>
          </Statistic>
          <Statistic>
            <StatisticNumber>{cpu.toFixed(2)}%</StatisticNumber>
            <StatisticLabel>CPU</StatisticLabel>
          </Statistic>
        </StatisticContainer>

        <WidePage>
          {data ? (
            <div>
              <h3>Madoc Version</h3>
              <ul>
                <li>
                  <strong>Version: </strong>
                  {data.build.version.startsWith('v') ? (
                    <a
                      href={`https://github.com/digirati-co-uk/madoc-platform/releases/tag/${data.build.version}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.build.version}
                    </a>
                  ) : (
                    data.build.version
                  )}
                </li>
                <li>
                  <strong>Revision: </strong>
                  {data.build.revision === 'unknown' ? (
                    'unknown'
                  ) : (
                    <a
                      href="https://github.com/digirati-co-uk/madoc-platform/commit/630a0aa3c2d02b9badfc84916a2d60aca4eef9bc"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.build.revision}
                    </a>
                  )}
                </li>
                {data.build.time !== 'unknown' ? (
                  <li>
                    <strong>Built at: </strong>
                    <TimeAgo date={new Date(data.build.time)} />
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
          {systemCheck ? (
            <div>
              <h3>{systemCheck.email.enabled ? 'Email server is running' : 'Email server is not running'}</h3>
              <ul>
                {systemCheck.email.issues.map((issue, n) => {
                  return <li key={n}>{issue}</li>;
                })}
              </ul>
            </div>
          ) : null}

          <h3>Docker images</h3>

          <ButtonRow>
            <Button onClick={() => restart('queue')} disabled={restartStatus.isLoading}>
              {t('Restart queue')}
            </Button>
            <Button onClick={() => restart('madoc')} disabled={restartStatus.isLoading}>
              {t('Restart madoc')}
            </Button>
            <Button onClick={() => restart('auth')} disabled={restartStatus.isLoading}>
              {t('Restart auth')}
            </Button>
            <Button onClick={() => restart('scheduler')} disabled={restartStatus.isLoading}>
              {t('Restart scheduler')}
            </Button>
            <Button onClick={() => migrateModels()} disabled={migrateModelsStatus.isLoading}>
              {t('Migrate models')}
            </Button>
            <Button onClick={() => migrateProjectMembers()} disabled={migrateProjectMembersStatus.isLoading}>
              Migrate project members
            </Button>
            <Button onClick={() => migrateInvalidUsers()} disabled={migrateInvalidUsersStatus.isLoading}>
              Migrate invalid users
            </Button>
          </ButtonRow>

          {migrateModelsStatus.data ? (
            (migrateModelsStatus.data as any).complete ? (
              <SuccessMessage>Nothing to migrate</SuccessMessage>
            ) : (
              <SuccessMessage>
                Migration in progress{' '}
                <HrefLink href={`/tasks/${(migrateModelsStatus.data as any).id}`}>Go to task</HrefLink>
              </SuccessMessage>
            )
          ) : null}

          {migrateProjectMembersStatus.data ? <SuccessMessage>Migration complete</SuccessMessage> : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            {data
              ? data.list.map(item => {
                  const memory = Math.round((item.monit.memory / item.max_memory_restart) * 100);
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: '#eee',
                        borderRadius: 5,
                        padding: 30,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <h3 style={{ margin: 0, marginBottom: 10, borderBottom: '1px solid #CCC', paddingBottom: 10 }}>
                        {item.name}
                      </h3>
                      <div>
                        <strong>Status:</strong> <span>{item.status}</span>
                      </div>
                      <div>
                        <strong>Instances:</strong> <span>{item.instances}</span>
                      </div>
                      <div>
                        <strong>Restarted:</strong>{' '}
                        <span>
                          <TimeAgo date={new Date(item.uptime)} />
                        </span>
                      </div>
                      <br />
                      <div>
                        <strong>CPU:</strong> <span>{item.monit.cpu}%</span>
                      </div>
                      <div style={{ display: 'flex', background: '#ddd', marginTop: 5, marginBottom: 20 }}>
                        <div
                          style={{
                            height: 3,
                            background: item.monit.cpu > 70 ? 'orange' : item.monit.cpu > 90 ? 'red' : 'green',
                            width: `${Math.round(item.monit.cpu)}%`,
                          }}
                        />
                      </div>
                      <div>
                        <strong>Memory</strong> <span>{Math.round(item.monit.memory / 1000 / 10) / 100}mb</span>
                        <span> ({memory}%)</span>
                      </div>
                      <div style={{ display: 'flex', background: '#ddd', marginTop: 5, marginBottom: 15 }}>
                        <div
                          style={{
                            height: 3,
                            background: memory > 70 ? 'orange' : memory > 90 ? 'red' : 'green',
                            width: `${memory}%`,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.6em' }}>
                        {Object.entries(item.stats).map(([name, { value, unit }]) => {
                          return (
                            <div key={name}>
                              <strong>{name}</strong>: <span>{value}</span>
                              <span>{unit}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: 20 }}>
                        <Button onClick={() => restart(item.name as any)} disabled={restartStatus.isLoading}>
                          {t('Restart')}
                        </Button>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>

          <div>
            <h3>Slow requests</h3>
            <table className="p-2 w-full">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Count</th>
                  <th>Average time</th>
                  <th>Max time</th>
                </tr>
              </thead>
              {slowestRequests.map(slow => (
                <tr key={slow.key}>
                  <td className="p-2">{slow.key}</td>
                  <td className="p-2">{slow.count}</td>
                  <td className="p-2">{(slow.avg / 1000).toFixed(2)}s</td>
                  <td className="p-2">{(slow.slowest / 1000).toFixed(2)}s</td>
                </tr>
              ))}
            </table>
          </div>
        </WidePage>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getPm2Status();
    },
    getKey() {
      return ['pm2-status', {}];
    },
  }
);

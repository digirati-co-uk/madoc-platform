import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { Pm2Status } from '../../../../types/pm2';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../../shared/atoms/Statistics';
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

type SystemStatusType = {
  data: { list: Pm2Status[] };
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

          {data
            ? data.list.map(item => {
                return (
                  <div key={item.id}>
                    <h3>{item.name}</h3>
                    <div>
                      <strong>Status</strong> <span>{item.status}</span>
                    </div>
                    <div>
                      <strong>Instances</strong> <span>{item.instances}</span>
                    </div>
                    <div>
                      <strong>CPU</strong> <span>{item.monit.cpu}%</span>
                    </div>
                    <div>
                      <strong>Memory</strong> <span>{Math.round(item.monit.memory / 1000 / 10) / 100}mb</span>
                    </div>
                  </div>
                );
              })
            : null}
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
